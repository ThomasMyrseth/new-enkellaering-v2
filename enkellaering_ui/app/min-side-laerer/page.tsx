"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Classes } from "../admin/types";
import { Teacher, Student } from "../admin/types";
import { AddNewClass } from "./addNewClass";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080/server";

import { NewStudentsWithPreferredTeacherWorkflowActions, UnacceptedStudentsTable} from "./newStudents"
import QuizStatusPage from "./quiz";
import { FileUploadForm } from "@/components/uploadTeacherImageForm";
import { YourStudent } from "./yourStudents";
import { TeacherName  } from "./teacherName";
import { WantMoreStudents } from "./wantsMoreStudents";
import { DailyRevenueChart } from "./revenueChart";
import { ProfileForm } from "./changeProfileInfo";

export default function LaererPage() {
    const [teacher, setTeacher] = useState<Teacher>()
    const [classes, setClasses] = useState<Classes[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const router = useRouter()

    const token :string = localStorage.getItem('token') || ''

    useEffect(() => {
        async function getData() {
            const students = await fetchStudents(token)
            const classes = await fetchClasses(token)
            const teacher = await fetchTeacherName(token)

            if (!teacher) {
                router.push('/login-laerer')
                return
            }

            setTeacher(teacher)
            setClasses(classes)
            setStudents(students)
        }

        getData()
    
    },[])

    if (!teacher) {
        return (<p>Loading...</p>)
    }

    return (<div className="flex flex-col items-center justify-center w-full min-h-screen bg-slate-200 dark:bg-slate-900">
            <TeacherName teacher={teacher}/>
            <NewStudentsWithPreferredTeacherWorkflowActions teacher={teacher}/>
            <br/>
            <UnacceptedStudentsTable teacher={teacher}/>

            <ProfileForm teacher={teacher}/>
            <WantMoreStudents teacher={teacher}/>

            <QuizStatusPage token={token} baseUrl={BASEURL}/>

            <DailyRevenueChart teacher={teacher}/>
            <br />
            <AddNewClass teacher={teacher}/>
            <br/>
            <YourStudent teacher={teacher} classes={classes} students={students}/>
            <br/>
            <FileUploadForm firstname={teacher.firstname} lastname={teacher.lastname} title={"Last opp et bilde av deg"}/>

        <div className="p-4 m-4">
        </div>

    </div>)

}



async function fetchTeacherName(token :string) {
    const response = await fetch(`${BASEURL}/get-teacher`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (response.ok) {
        const data = await response.json()
        return data.teacher
    }

    else {
        return false
    }
}

//get classes for teacher
async function fetchClasses(token :string) {
    const response = await fetch(`${BASEURL}/get-classes-for-teacher`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        },
    })

    if(!response.ok) {
        return null;
    }

    const data = await response.json()
    const classes = data.classes

    return classes
}


async function fetchStudents(token :string) {
    const response = await fetch(`${BASEURL}/get-students`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    const r = await response.json()

    let students = r.students

    //order the students alfabetically
    students = students.sort( (a :Student, b :Student) => {
        const nameA = a.firstname_parent.toUpperCase()
        const nameB = b.firstname_parent.toUpperCase()
        if (nameA < nameB) {
            return -1
        }
        if (nameA > nameB) {
            return 1
        }
        return 0
    })
    return students
}






