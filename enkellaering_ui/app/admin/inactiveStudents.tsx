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

            //alfabetcical sort
            s.sort((a: Student, b: Student) => {
                const nameA = a.firstname_parent.toUpperCase();
                const nameB = b.firstname_parent.toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
            setStudents(s)
        }

        fetchData()
    },[])

    

    return(<div className="w-full flex flex-col items-center justify-center shadow-lg dark:bg-black bg-white rounded-lg m-4 p-4">
    <h3 className="pt-4">Inaktive elever</h3>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Forelder</TableHead>
                    <TableHead>Forelders tlf</TableHead>

                    <TableHead>Elev</TableHead>
                    <TableHead>Elev tlf</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody key={'2'}>
                {students.map( (s :Student) => {

                    //do not display students that are active
                if (s.is_active===true) {
                    return null
                }
                else {
                    return (<>
                        <TableRow key={s.user_id}>
                            <TableCell>
                                {s.firstname_parent} {s.lastname_parent}
                            </TableCell>
                            <TableCell>
                                {s.phone_parent}
                            </TableCell>

                            <TableCell>
                                {s.firstname_student} {s.lastname_student}
                            </TableCell>
                            <TableCell>
                                {s.phone_student}
                            </TableCell>
                            <TableCell>
                                <Button className="w-full" onClick={() => handleSetActive(s)}>
                                    Sett {s.firstname_parent} til aktiv
                                </Button>
                            </TableCell>
                        </TableRow>
                    </>)
                }    
                })
                }
            </TableBody>
        </Table>   
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
