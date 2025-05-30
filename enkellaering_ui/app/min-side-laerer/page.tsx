"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Classes, TeacherStudent } from "../admin/types";
import { Teacher, Student } from "../admin/types";
import { AddNewClass } from "./addNewClass";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080/server";

import { NewStudentsWithPreferredTeacherWorkflowActions} from "./newStudents"
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
    const [teacherStudents, setTeacherStudents] = useState<TeacherStudent[]>([])
    const router = useRouter()

    const token :string = localStorage.getItem('token') || ''

    useEffect(() => {
        async function getData() {
            const students = await fetchStudents(token);
            const classes = await fetchClasses(token);
            const teacher = await fetchTeacherName(token);
            const tss: TeacherStudent[] = await fetchTeacherStudents(token);

            // Build a set of valid student IDs for fast lookup
            const studentIds = new Set(students.map((s: Student) => s.user_id));

            // Filter only those teacher-student records matching this teacher and existing students
            const ts = tss.filter((ts: TeacherStudent) =>
                ts.teacher_user_id === teacher.user_id &&
                studentIds.has(ts.student_user_id)
            );

            if (!teacher) {
                router.push('/login-laerer')
                return
            }

            setTeacher(teacher)
            setClasses(classes)
            setStudents(students)
            setTeacherStudents(ts);
        }

        getData()
    
    },[router, token])

    if (!teacher) {
        return (<p>Loading...</p>)
    }

    return (<div className="flex flex-col items-center justify-center w-full min-h-screen bg-slate-200 dark:bg-slate-900">
            <TeacherName teacher={teacher}/>
            <div className="w-full md:w-4/5 flex flex-col space-y-4 mt-4">
                <DailyRevenueChart teacher={teacher}/>
                <WantMoreStudents teacher={teacher}/>
                <AddNewClass teacher={teacher} students={students}/>
                <YourStudent teacher={teacher} classes={classes} students={students} teacherStudents={teacherStudents}/>
                <NewStudentsWithPreferredTeacherWorkflowActions/>
                <ProfileForm teacher={teacher}/>
                <QuizStatusPage token={token} baseUrl={BASEURL}/>
                <FileUploadForm firstname={teacher.firstname} lastname={teacher.lastname} title={"Last opp et bilde av deg"}/>
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

async function fetchTeacherStudents(token :string) {
    const response = await fetch(`${BASEURL}/get-teacher-student`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if(!response.ok) {
        return null;
    }

    const data = await response.json()
    const ts = data.teacher_student

    return ts
}






