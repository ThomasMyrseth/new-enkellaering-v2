"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation";
  
import { DailyRevenueChart } from "./dailyRevenue";
import { TeacherName } from "./teacherName";
import { NewStudentsWorkflow } from "./newStudentsWorkflow";
import { PreviousClassesForEachTeacher } from "./previousClassesForEachTeacher copy";
import { PreviousClassesForEachStudent } from "./previousClassesForEachStudent";

import { Teacher } from "./types";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;




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

    return(<div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950">
        <TeacherName teacher={teacher}/>
        <div className="flex flex-col items-center justify-center w-3/4 space-y-10">
            <DailyRevenueChart admin_user_id={userId}/>
            <PreviousClassesForEachTeacher admin_user_id={userId}/>
            <PreviousClassesForEachStudent admin_user_id={userId}/>
            <NewStudentsWorkflow user_id={userId}/>
        </div>
        <div className="h-10"> </div>

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






