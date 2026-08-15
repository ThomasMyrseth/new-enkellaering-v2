"use client"
import React, {useMemo} from "react"
import { Teacher } from "./types"
import { useTeachers } from "@/hooks/use-teachers"

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
import { toast } from "sonner"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export const ResignedTeachers = () => {
    const [teachers, loading, error] = useTeachers(true)

    const resignedTeachers = useMemo(() => {
        return teachers
            .filter(t => t.resigned === true)
            .sort((a: Teacher, b: Teacher) => {
                // Handle null/undefined resigned_at dates
                if (!a.resigned_at && !b.resigned_at) return 0;
                if (!a.resigned_at) return 1; // Put teachers without resigned_at at the end
                if (!b.resigned_at) return -1;

                const dateA = new Date(a.resigned_at);
                const dateB = new Date(b.resigned_at);

                // Most recent resignations first (reverse chronological)
                return dateB.getTime() - dateA.getTime();
            });
    }, [teachers]);

    if (error) toast.error("Error fetching teachers: " + error);

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

    const TeacherRow = ({ teacher }: { teacher: Teacher }) => (
        <TableRow key={teacher.user_id}>
            <TableCell>
                {teacher.firstname} {teacher.lastname}
            </TableCell>
            <TableCell>
                {teacher.phone}
            </TableCell>
            <TableCell>
                {teacher.email}
            </TableCell>
            <TableCell>
                {teacher.address}, {teacher.postal_code}
            </TableCell>
            <TableCell>
                <Button variant="secondary" className="w-full" onClick={() => handleReactivateTeacher(teacher)}>
                    Reaktiver {teacher.firstname}
                </Button>
            </TableCell>
        </TableRow>
    );

    return(<div className="w-full flex flex-col items-center justify-center shadow-lg dark:bg-black bg-white rounded-lg p-4">
        <h3 className="pt-4">Pensjonerte lærere ({resignedTeachers.length})</h3>
        
        {resignedTeachers.length === 0 ? (
            <p className="text-gray-500 mt-4">Ingen pensjonerte lærere funnet</p>
        ) : (
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="resigned-teachers">
                    <AccordionTrigger>
                        Pensjonerte lærere ({resignedTeachers.length})
                    </AccordionTrigger>
                    <AccordionContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Navn</TableHead>
                                    <TableHead>Telefon</TableHead>
                                    <TableHead>E-post</TableHead>
                                    <TableHead>Adresse</TableHead>
                                    <TableHead>Handlinger</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {resignedTeachers.map(teacher => (
                                    <TeacherRow key={teacher.user_id} teacher={teacher} />
                                ))}
                            </TableBody>
                        </Table>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        )}
    </div>)
}

const handleReactivateTeacher = async (teacher: Teacher) => {
    const token = localStorage.getItem('token')
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;

    try {
        const response = await fetch(`${BASEURL}/reactivate-teacher`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                "teacher_user_id": teacher.user_id
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        toast.success(`${teacher.firstname} ${teacher.lastname} har blitt reaktivert`)

    } catch (error) {
        toast.error(`Failed to reactivate teacher: ${error}`);
    }
}
