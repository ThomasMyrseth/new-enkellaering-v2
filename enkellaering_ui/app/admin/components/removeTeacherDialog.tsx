"use client"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Student, Teacher } from "../types"
import { TeacherStudent } from "@/types/teacher-student"

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL

const handleRemoveTeacher = async (student: Student, teacher: Teacher) => {
    const token = localStorage.getItem('token')
    try {
        const response = await fetch(`${BASEURL}/remove-teacher-from-student`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                student_user_id: student.user_id,
                teacher_user_id: teacher.user_id
            })
        })

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`)
        }
        toast.success(`${teacher.firstname} ${teacher.lastname} ble fjernet fra ${student.firstname_parent} ${student.lastname_parent}`)
    } catch (error) {
        toast.error(`Fjerning mislyktes: ${error}`)
    }
}

const handleUpdateTravelPay = async (travelPayToTeacher: number, travelPayFromStudent: number, studentUserId: string, teacherUserId: string) => {
    const token = localStorage.getItem('token')
    try {
        const response = await fetch(`${BASEURL}/update-travel-pay`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                travel_pay_to_teacher: travelPayToTeacher,
                travel_pay_from_student: travelPayFromStudent,
                student_user_id: studentUserId,
                teacher_user_id: teacherUserId
            })
        })

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`)
        }
        toast.success("Reisetillegg oppdatert")
    } catch (error) {
        toast.error(`Oppdatering mislyktes: ${error}`)
    }
}

export const RemoveTeacherDialog = ({ student, teacher, teacherStudent }: { student: Student, teacher: Teacher, teacherStudent?: TeacherStudent }) => {
    const [travelPayToTeacher, setTravelPayToTeacher] = useState<number>(teacherStudent?.relation.travel_pay_to_teacher || 0)
    const [travelPayFromStudent, setTravelPayFromStudent] = useState<number>(teacherStudent?.relation.travel_pay_from_student || 0)

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="secondary">{teacher.firstname} {teacher.lastname}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Rediger forhold mellom elev og lærer</AlertDialogTitle>
                    <AlertDialogDescription>
                        Er du sikker på at du vil fjerne {teacher.firstname} {teacher.lastname} fra {student.firstname_parent} {student.lastname_parent}?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogContent>
                    <div className="flex flex-row space-x-2 w-full">
                        <div className="flex flex-col space-y-1 w-full">
                            <Label className="text-sm font-medium ">Reisetillegg fakturert fra elev</Label>
                            <Input type="number" placeholder="Reisetillegg" className="w-full" value={travelPayFromStudent} onChange={(e) => setTravelPayFromStudent(Number(e.target.value))} />
                        </div>

                        <div className="flex flex-col space-y-1 w-full">
                            <Label className="text-sm font-medium ">Reisetillegg betalt til lærer</Label>
                            <Input type="number" placeholder="Reisetillegg" className="w-full" value={travelPayToTeacher} onChange={(e) => setTravelPayToTeacher(Number(e.target.value))}/>
                        </div>
                    </div>

                    <Button variant="secondary" onClick={() => {
                        handleUpdateTravelPay(travelPayToTeacher, travelPayFromStudent, student.user_id, teacher.user_id)
                    }}>Lagre</Button>
                    <Button variant="destructive" onClick={() => handleRemoveTeacher(student, teacher)}>Fjern {teacher.firstname} fra {student.firstname_parent}</Button>
                    <AlertDialogCancel>Exit</AlertDialogCancel>
                </AlertDialogContent>
            </AlertDialogContent>
        </AlertDialog>
    )
}
