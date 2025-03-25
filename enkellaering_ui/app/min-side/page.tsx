"use client"
import { useEffect, useState } from "react";

import LeaveReview from "./review";
import { Student, Teacher } from "../admin/types";

import { StudentName } from "./studentName";
import { IsActive } from "./isActive";
import { MyTeachers } from "./myTeacher";
import { PreviousClasses } from "./previousClasses";
import OrderCardsCarouselDemo from "./newStudents/orderCards";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080/server";


export default function MinSideStudentPage() {
    const token = localStorage.getItem('token') || ''
    const [student, setStudent] = useState<Student>()
    const [teachers, setTeachers] = useState<Teacher[]>()


    //fetch data
    useEffect( () => {
        async function fetchData() {
            const s = await fetchStudent(token)
            const t = await fetchTeacher(token)
    
            if (t) {
                setTeachers(t)
            }
            if (s) {
                setStudent(s)
            }
        }
        fetchData()
    },[])

    if (!student || !teachers) {
        return (<>
            <p>Loading...</p>
        </>)
    }
    return (
        <div className="flex flex-col items-center justify-center  w-full min-h-screen bg-slate-200 dark:bg-slate-900">
            <IsActive student={student}/>
            <StudentName student={student} />
            <div className="flex flex-col items-center justify-center m-4">
                <IsActive student={student}/>
                <OrderCardsCarouselDemo/>
                <MyTeachers teachers={teachers} />;
                <IsActive student={student}/>
                <PreviousClasses student={student} />
                <IsActive student={student}/>
    
                <LeaveReview baseUrl={BASEURL} token={token} teachers={teachers} student={student} />
            </div>

        </div>
    );
}




async function fetchTeacher(token :string) {
    const response = await fetch(`${BASEURL}/get-teacher-for-student`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        return null
    }

    const data = await response.json()
    const teachers : Teacher[]= data.teachers
    
    if (!teachers || Object.keys(teachers).length === 0) {
        return false;
    } else {
        return teachers
    }
}

async function fetchStudent(token :string) {
    const response = await fetch(`${BASEURL}/get-student`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        },
    })

    if (!response.ok) {
        return false;
    }


    const data = await response.json()
    return data.student
}

