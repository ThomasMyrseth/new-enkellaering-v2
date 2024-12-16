"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation";
  
import { DailyRevenueChart } from "./dailyRevenue";
import { TeacherName } from "./teacherName";
import { NewStudentsWorkflow } from "./newStudentsWorkflow";
import { PreviousClassesForEachTeacher } from "./previousClassesForEachTeacher";

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

type Classes = {
    teacher_user_id :string;
    student_user_id :string;
    created_at: string;
    started_at: string;
    ended_at: string;
    comment: string;
    paid_teacher: boolean;
    invoiced_student: boolean;
    paid_teacher_at :string;
    invoiced_student_at :string;
    class_id :string;
};


export default function AdminPage() {
    const router = useRouter()
    const [teacher, setTeacher] = useState<Teacher>()
    const pathname = usePathname(); // Get the current pathname
    const segments = pathname.split('/'); // Split the pathname into segments
    const userId :string= segments[2].toString(); // Extract the 'user_id' from the correct position

    function handleSetTeacher(teacher: Teacher) {
        setTeacher(teacher)
    }

    protectAdmin({user_id: userId, handleSetTeacher})

    //this user is an admin
    if (!teacher) {
        return <p>Loading...</p>
    }

    if(!teacher.admin) {
        console.log("Du er ikk en admin")
        router.push("/login-teacher")
    }

    return(<div>
        <TeacherName teacher={teacher}/>
        <DailyRevenueChart admin_user_id={userId}/>
        <PreviousClassesForEachTeacher user_id={userId}/>
        <br/>
        <NewStudentsWorkflow user_id={userId}/>

    </div>)
}

function protectAdmin( {user_id, handleSetTeacher} :{user_id: string, handleSetTeacher: (teacher: Teacher) => void}) {
    const [isAdmin, setIsAdmin] = useState<boolean>(false)
    
    useEffect( () => {

        async function fetchTeacher(user_id :string) {
            const response = await fetch(`${BASEURL}/get-teacher`, {
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
                setIsAdmin(false)
            }

            const data = await response.json()
            const teacher = data.teacher
            handleSetTeacher(teacher)

            if (teacher.admin) {
                setIsAdmin(true)
            }
            else {
                setIsAdmin(false)
            }
        }
        fetchTeacher(user_id)

    },[BASEURL, user_id])

    return isAdmin
}






