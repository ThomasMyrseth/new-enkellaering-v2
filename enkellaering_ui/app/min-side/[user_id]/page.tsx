"use client"
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PinContainer } from "@/components/ui/3d-pin";


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
        <div className="h-[40rem] w-full flex items-center justify-center ">
      <PinContainer
        title={hasTeacher ? `Deres lærer er ${teacher?.firstname} ${teacher?.lastname}` : 'Ingen lærer tildelt'}
    >
        <div className="flex basis-full flex-col p-4 tracking-tight text-slate-100/50 sm:basis-1/2 w-[20rem] h-[20rem] ">
          <h3 className="max-w-xs !pb-2 !m-0 font-bold  text-base text-slate-100">
            {teacher?.firstname} {teacher?.lastname}
          </h3>
          <div className="text-base !m-0 !p-0 font-normal">
            { hasTeacher && (
            <p>
                <span className="font-extralight">Telefon:</span> <span className="font-semibold">{teacher?.phone}</span>
                <br/>
                <span className="font-extralight">Epost: </span> <span className="font-semibold">{teacher?.email}</span>
                <br/>
                <span className="font-extralight">Adresse:</span> <span className="font-semibold"> {teacher?.address}</span>
                <br/>
                <span className="font-extralight">Postnummer: </span> <span className="font-semibold">{teacher?.postal_code}</span>
            </p>
            )}
            {!hasTeacher && (
                <p>
                    Deres lærer er ikke blitt oppsatt enda.
                    <br/>
                    Dersom dette vedvarer i flere dager kan du ringe 
                    <br/>
                    <span className="text-semibold">Thomas Myrseth på 47 18 47 44</span>
                </p>
            )}
          </div>
          <div className="flex flex-1 w-full rounded-lg mt-4 bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500" />
        </div>
      </PinContainer>
    </div>
    )
}