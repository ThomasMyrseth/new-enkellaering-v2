"use client"

import { useEffect, useState } from "react"
import { StudentTaskWorkflow } from "../studentTasksWorkflow"
import { TeacherTasksWorkflow } from "../teacherTasksWorkflow"
import { StudentsWithoutAnyTeachers } from "../studentsWithoutTeacher"
import { PreviousClassesForEachTeacher } from "../previousClassesForEachTeacher"
import { PreviousClassesForEachStudent } from "../previousClassesForEachStudent"

export default function AdminActivePage() {
    const [token, setToken] = useState<string | null>(null)
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080"

    useEffect(() => {
        setToken(localStorage.getItem('token'))
    }, [])

    if (!token) return null

    return (<>
        <StudentTaskWorkflow />
        <TeacherTasksWorkflow />
        <StudentsWithoutAnyTeachers token={token} BASEURL={BASEURL} />
        <PreviousClassesForEachTeacher />
        <PreviousClassesForEachStudent />
    </>)
}
