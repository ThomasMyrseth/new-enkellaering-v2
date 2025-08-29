"use client"
import React, {useEffect, useState} from "react"
import { Student } from "./types"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export const InactiveStudents = () => {
    const [students, setStudents] = useState<Student[]>([])

    //fetch data
    useEffect(() => {
        async function fetchData() {
            const token = localStorage.getItem('token')
            if (!token) {
                alert("Token not found")
                return
            }
            const s: Student[] =  await getStudents(token)

            //order by name
            s.sort((a, b) => {
                const nameA = `${a.firstname_parent} ${a.lastname_parent}`.toLowerCase();
                const nameB = `${b.firstname_parent} ${b.lastname_parent}`.toLowerCase();
                return nameA.localeCompare(nameB);
            });
            setStudents(s)
        }

        fetchData()
    },[])

    

    const inactiveStudents = students.filter(s => s.is_active === false);

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
                <Button className="w-full" onClick={() => handleSetActive(student)}>
                    Sett {student.firstname_parent} til aktiv
                </Button>
            </TableCell>
        </TableRow>
    );

    return(<div className="w-full flex flex-col items-center justify-center shadow-lg dark:bg-black bg-white rounded-lg m-4 p-4">
        <h3 className="pt-4">Inaktive elever ({inactiveStudents.length})</h3>
        
        {inactiveStudents.length === 0 ? (
            <p className="text-gray-500 mt-4">Ingen inaktive elever funnet</p>
        ) : (
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="inactive-students">
                    <AccordionTrigger>
                        Inaktive elever ({inactiveStudents.length})
                    </AccordionTrigger>
                    <AccordionContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Forelder</TableHead>
                                    <TableHead>Forelders tlf</TableHead>
                                    <TableHead>Elev</TableHead>
                                    <TableHead>Elev tlf</TableHead>
                                    <TableHead>Handlinger</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inactiveStudents.map(student => (
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

const handleSetActive = async (student: Student) => {
    const token = localStorage.getItem('token')
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;

    try {
        const response = await fetch(`${BASEURL}/set-student-to-active`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                "student_user_id": student.user_id
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }

        alert(`${student.firstname_parent} ${student.lastname_parent} er satt til aktiv`)

    } catch (error) {
        alert(`Failed to set student inactive: ${error}`);
    }
}



async function getStudents(token :string) {
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

    const response = await fetch(`${BASEURL}/get-all-students`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        alert("Error fetching students " + response.statusText);
        return [];
    }

    const data = await response.json();
    const students: Student[] = data.students;

    if (students.length === 0) {
        alert("No students found");
        console.log("No students found");
        return [];
    } else {
        return students;
    }
}
