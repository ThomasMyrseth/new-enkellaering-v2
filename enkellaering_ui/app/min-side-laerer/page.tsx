"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import QuizStatusPage from "./quiz";
import { NewStudentsWithPreferredTeacherWorkflowActions, UnacceptedStudentsTable} from "./newStudents"
import { Classes } from "../admin/types";
import { Teacher, Student } from "../admin/types";
import { AddNewClass } from "./addNewClass";



const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080/server";

import { FileUploadForm } from "@/components/uploadTeacherImageForm";
import { YourStudent } from "./yourStudents";
import { TeacherName  } from "./teacherName";
import { WantMoreStudents } from "./wantsMoreStudents";
import { DailyRevenueChart } from "./revenueChart";

export default function LaererPage() {
    const [teacher, setTeacher] = useState<Teacher>()
    const [classes, setClasses] = useState<Classes[]>([])
    const [students, setStudents] = useState<Student[]>([])
    const router = useRouter()

    const token :string = localStorage.getItem('token') || ''

    useEffect(() => {
        async function fetchTeacherName() {
            const response = await fetch(`${BASEURL}/get-teacher`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setTeacher(data.teacher)
            }

            else {
                router.push('/login-laerer')
            }
        }

        //get classes for teacher
        async function fetchClasses() {
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

            setClasses(classes)
        }


        async function fetchStudents() {
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
            setStudents(students)
        }

        fetchStudents()
        fetchClasses()
        fetchTeacherName()
    
    },[])

    if (!teacher) {
        return (<p>Loading...</p>)
    }

    return (<div className="flex flex-col items-center justify-center w-full min-h-screen bg-slate-200 dark:bg-slate-900">
            <TeacherName teacher={teacher}/>
            <NewStudentsWithPreferredTeacherWorkflowActions teacher={teacher}/>
            <br/>
            <UnacceptedStudentsTable teacher={teacher}/>

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









