"use client"

import { StudentTaskWorkflow } from "../studentTasksWorkflow"
import { TeacherTasksWorkflow } from "../teacherTasksWorkflow"
import { StudentsWithoutAnyTeachers } from "../studentsWithoutTeacher"
import { PreviousClassesForEachTeacher } from "../previousClassesForEachTeacher"
import { PreviousClassesForEachStudent } from "../previousClassesForEachStudent"

export default function AdminActivePage() {
    const token = localStorage.getItem('token')!
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080"

    return (<>
        <StudentTaskWorkflow />
        <TeacherTasksWorkflow />
        <StudentsWithoutAnyTeachers token={token} BASEURL={BASEURL} />
        <PreviousClassesForEachTeacher />
        <PreviousClassesForEachStudent />
    </>)
}
