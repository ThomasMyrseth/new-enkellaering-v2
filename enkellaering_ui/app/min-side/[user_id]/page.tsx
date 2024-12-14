"use client"
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Image from "next/image";


const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;

type Student = {
    user_id: string,
    firstname_parent: string,
    lastname_parent: string,
    email_parent: string,
    phone_parent: string,

    firstname_student: string,
    lastname_student: string,
    phone_student: string,

    main_subjects: string,
    address: string,
    postal_code: string,
    has_physical_tutoring: boolean,
    created_at: string,
    additional_comments: string,
    your_teacher: string
}

type Teacher = {
    user_id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    postal_code: string;
    hourly_pay: string;
    resgined: boolean;
    additional_comments: string | null;
    created_at: string;
    admin: boolean;
    resigned_at: string | null;
}

export default function MinSideStudentPage() {
    const pathname = usePathname(); // Get the current pathname
    const segments = pathname.split('/'); // Split the pathname into segments
    const userId :string= segments[2].toString(); // Extract the 'user_id' from the correct position
    const [student, setStudent] = useState<Student>()

    useEffect( () => {
        async function fetchStudent() {
            const response = await fetch(`${BASEURL}/get-student`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "user_id": userId
                })
            })

            if (!response.ok) {
                alert("failed to fetch student: " + response.statusText)
            }


            const data = await response.json()
            setStudent(data.student) //returns a single student
        }

        fetchStudent()
    },[BASEURL, userId])

    if (!student) {
        return (<>
            <p>Loading...</p>
        </>)
    }
    return(<>
        <MyTeacher user_id={student.user_id}/>
    </>)
}

function MyTeacher({user_id} : {user_id: string}) {
    const [loading, setLoading] = useState<boolean>(true)
    const [teacher, setTeacher] = useState<Teacher>()
    const [hasTeacher, setHasTeacher] = useState<boolean>(false)

    useEffect( () => {
        async function fetchTeacher() {
            const response = await fetch(`${BASEURL}/get-teacher-for-student`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "user_id": user_id
                })
            })

            if (!response.ok) {
                alert("failed to fetch teacher: " + response.statusText)
                return null
            }

            const data = await response.json()
            const teacher = data.teacher
            console.log(teacher)
            
            if (teacher.length === 0) {
                console.log("Student doesn't have a teacher yet");
                setHasTeacher(false);
                setLoading(false)
            }
            else {
                setHasTeacher(true)
                setTeacher(data.teacher)
                setLoading(false)
            }
    }
    fetchTeacher()
    },[user_id])

    if (loading) {
        return <p>Loading...</p>
    }


    return(
        <CardContainer className="inter-var">
            <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
                <CardItem
                    translateZ="50"
                    className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                {hasTeacher ? (
                    <>
                        <span className="font-light">Deres lærer er</span> {teacher?.firstname} {teacher?.lastname}
                    </>
                ) : (
                    <span>Dere har ikke fått oppsatt en lærer enda.</span>
                )}
                </CardItem>
                <CardItem
                    as="p"
                    translateZ="60"
                    className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                >
                    { hasTeacher?
                    <p>
                        <span className="font-light">Telefon: </span><span className="font-bold">{teacher?.phone}  </span>
                        <br />
                        <span className="font-light">Epost: </span><span className="font-bold">{teacher?.email}  </span>
                        <br />
                        <span className="font-light">Adresse: </span><span className="font-bold">{teacher?.address}</span>
                        <br />
                        <span className="font-light">Postnummer: </span><span className="font-bold">{teacher?.postal_code}</span>
                    </p>
                    :
                    <p>Dersom dette vedvarer mer enn noen dager kan dere kontakte: 
                        <br/>
                        <span className="font-bold">Thomas Myrseth tlf: <span className="text-underline">47184744</span></span>
                    </p>
                    }
                </CardItem>
                <CardItem
                translateZ="100"
                rotateX={20}
                rotateZ={-10}
                className="w-full mt-4"
                >
                <Image
                    src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    height="1000"
                    width="1000"
                    className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                    alt="thumbnail"
                />
                </CardItem>
            </CardBody>
    </CardContainer>
  );
}