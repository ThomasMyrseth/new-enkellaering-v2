"use client"
import React, {useMemo} from "react"
import { Student } from "./types"
import { useStudents } from "@/hooks/use-students"
import { apiFetch } from "@/lib/api"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from "sonner"

const formatFrozenSince = (statusChangedAt: string | null) => {
    if (!statusChangedAt) return "Ukjent"

    const changedAt = new Date(statusChangedAt)
    const days = Math.max(0, Math.floor((Date.now() - changedAt.getTime()) / (1000 * 60 * 60 * 24)))

    return `${changedAt.toLocaleDateString("no-NO")} (${days} ${days === 1 ? "dag" : "dager"})`
}

export const FrozenStudents = () => {
    const [students, loading, error, setStudents] = useStudents()

    const handleUnfreeze = async (student: Student) => {
        try {
            await apiFetch("/unfreeze-student", {
                method: "POST",
                body: {
                    "student_user_id": student.user_id
                }
            });

            toast.success(`${student.firstname_parent} ${student.lastname_parent} er tint`)
            setStudents(prev => prev.map(s => s.user_id === student.user_id ? { ...s, status: 'active' } : s))

        } catch (error) {
            toast.error(`Failed to unfreeze student: ${error}`);
        }
    }

    const frozenStudents = useMemo(() => {
        return students
            .filter(s => s.status === 'frozen')
            .sort((a, b) => {
                const nameA = `${a.firstname_parent} ${a.lastname_parent}`.toLowerCase();
                const nameB = `${b.firstname_parent} ${b.lastname_parent}`.toLowerCase();
                return nameA.localeCompare(nameB);
            });
    }, [students]);

    if (error) toast.error("Error fetching students: " + error);

    if (loading) {
        return (
            <div className="w-full flex flex-col items-center justify-center shadow-lg dark:bg-black bg-white rounded-lg p-4">
                <Skeleton className="h-6 w-48 mt-4 mb-4" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    const StudentRow = ({ student }: { student: Student }) => (
        <TableRow key={student.user_id}>
            <TableCell>
                {student.firstname_parent} {student.lastname_parent}
            </TableCell>
            <TableCell>
                {student.phone_parent}
            </TableCell>
            <TableCell>
                {student.firstname_student} {student.lastname_student}
            </TableCell>
            <TableCell>
                {student.phone_student}
            </TableCell>
            <TableCell>
                {formatFrozenSince(student.status_changed_at)}
            </TableCell>
            <TableCell>
                <Button variant="secondary" className="w-full" onClick={() => handleUnfreeze(student)}>
                    Tin {student.firstname_parent}
                </Button>
            </TableCell>
        </TableRow>
    );

    return(<div className="w-full flex flex-col items-center justify-center shadow-lg dark:bg-black bg-white rounded-lg p-4">
        <h3 className="pt-4">Fryste elever ({frozenStudents.length})</h3>

        {frozenStudents.length === 0 ? (
            <p className="text-gray-500 mt-4">Ingen fryste elever funnet</p>
        ) : (
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="frozen-students">
                    <AccordionTrigger>
                        Fryste elever ({frozenStudents.length})
                    </AccordionTrigger>
                    <AccordionContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Forelder</TableHead>
                                    <TableHead>Forelders tlf</TableHead>
                                    <TableHead>Elev</TableHead>
                                    <TableHead>Elev tlf</TableHead>
                                    <TableHead>Frosset siden</TableHead>
                                    <TableHead>Handlinger</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {frozenStudents.map(student => (
                                    <StudentRow key={student.user_id} student={student} />
                                ))}
                            </TableBody>
                        </Table>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        )}
    </div>)
}
