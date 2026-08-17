"use client"
import { formatDateTime } from "@/lib/utils"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DeleteClass } from "../../min-side-laerer/deleteClass"
import { Classes, Teacher } from "../types"
import { TeacherStudent } from "@/types/teacher-student"
import { computeClassDuration, computeClassInvoiceAmount } from "./calculations"

export const ClassHistoryTable = ({
    classes,
    teachers,
    teacherStudents,
    studentFirstName,
    onClassDeleted,
}: {
    classes: Classes[],
    teachers: Teacher[],
    teacherStudents: TeacherStudent[],
    studentFirstName: string,
    onClassDeleted: (classId: string) => void,
}) => {
    return (
        <div className="overflow-x-auto overflow-y-auto max-h-96 w-full border rounded-md">
            <Table>
                <TableCaption>Kronologisk oversikt over alle timer til {studentFirstName}</TableCaption>
                <TableHeader className="sticky top-0 bg-white dark:bg-black z-10">
                    <TableRow>
                        <TableHead className="w-[100px]">Dato</TableHead>
                        <TableHead>Lærer</TableHead>
                        <TableHead>Varighet</TableHead>
                        <TableHead>Fakturert elev</TableHead>
                        <TableHead className="text-right">Fakturert beløp</TableHead>
                        <TableHead>Betalt lærer</TableHead>
                        <TableHead>Kommentar fra timen</TableHead>
                        <TableHead>Slett</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {classes.map((c: Classes, index) => {
                        const { durationHours, durationMinutes } = computeClassDuration(c)
                        const invoiceAmount = computeClassInvoiceAmount(c, teacherStudents)

                        const classTeacher = teachers.find(t => t.user_id === c.teacher_user_id)
                        const teacherName = classTeacher ? `${classTeacher.firstname} ${classTeacher.lastname}` : "Ukjent lærer"

                        return (
                            <TableRow key={index} className={`${c.was_canselled === true ? 'bg-red-50 dark:bg-red-950' : ''}`}>
                                <TableCell className="font-medium">{formatDateTime(c.started_at)}</TableCell>
                                <TableCell>{teacherName}</TableCell>
                                <TableCell>{`${durationHours}t ${durationMinutes}min`}</TableCell>
                                <TableCell>
                                    {c.invoiced_student ? (
                                        <p className="text-green-400">Fakturert</p>
                                    ) : (
                                        <p className="text-red-400">Ufakturert</p>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">{invoiceAmount}kr</TableCell>
                                <TableCell>
                                    {c.paid_teacher ? (
                                        <p className="text-green-400">Betalt</p>
                                    ) : (
                                        <p className="text-red-400">Ikke betalt</p>
                                    )}
                                </TableCell>
                                <TableCell>{c.comment}</TableCell>
                                <TableCell><DeleteClass classId={c.class_id} hasInvoiced={c.invoiced_student} hasPaid={c.paid_teacher} onDeleted={onClassDeleted}/></TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}
