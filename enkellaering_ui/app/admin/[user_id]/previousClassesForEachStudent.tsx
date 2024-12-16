"use client"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import { Classes, Student } from "./types";

import { useEffect, useState } from "react"


const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;



type ClassesJoinStudent = {
    classes: Classes[];
    student: Student;
}

export function PreviousClassesForEachStudent({user_id}: {user_id: string}) {      

    const [classes, setClasses] = useState<Classes[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [classesByStudents, setClassesByStudents] = useState<ClassesJoinStudent[]>([]);

    const [loading, setLoading] = useState<boolean>(true)
    let totalAmount :number = 0

    //get classes for everyone
    useEffect( () => {
        async function fetchClasses() {
            const response = await fetch(`${BASEURL}/get-all-classes`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "admin_user_id": user_id
                })
            })

            if(!response.ok) {
                alert("En feil har skjedd, prøv igjen")
                return null;
            }

            const data = await response.json()
            const classes = data.classes

            if (classes.length === 0) {
                setClasses([])
                setLoading(false)
            }
            else {
                setClasses(classes)
                setLoading(false)
            }
        }
        fetchClasses()
    
    },[user_id])

    //get all the students
    useEffect( () => {
        async function getAllStudents() {

            const response = await fetch(`${BASEURL}/get-all-students`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "admin_user_id": user_id
                })
            })

            if (!response.ok) {
                alert("Error fetching students " + response.statusText)
                setStudents([])
                return null
            }

            const data = await response.json()
            console.log("data", data)
            const students :Student[] = data.students

            if (students.length===0) {
                alert("No students found")
                console.log("No students found")
                setStudents([])
                return null
            }


            else {
                setStudents(students)
                setLoading(false)
            }
        }

        getAllStudents()
    },[BASEURL, user_id])


    //map each student to his classes
    useEffect( () => {
        
        if (!classes || !students) {
            alert("Teachers or classes not found")
        }

        const classesByStudent :ClassesJoinStudent[] = []
        //for each teacher go through every class
        students.forEach(s => {
            const classesForStudent :Classes[] = []
            classes.forEach(c => {
                if (c.student_user_id === s.user_id) {
                    classesForStudent.push(c)
                }
            })
            classesByStudent.push({
                classes: classesForStudent,
                student: s
            })
        })

        setClassesByStudents(classesByStudent)
        setLoading(false)
    },[classes, students])

    if (loading) {
        return <p>Loading...</p>
    }

      
    return (<div className="flex flex-col justify-center items-center w-full">
        <h2>En oversikt over tidligere timer</h2>

        {classesByStudents.map((cs :ClassesJoinStudent, index) => {
            const classes :Classes[] = cs.classes

            //sortng classes by startedAt
            classes.sort((a, b) => {
                const dateA = new Date(a.started_at);
                const dateB = new Date(b.started_at);
                return dateA.getTime() - dateB.getTime();
            });


            let totalUninvoicedStudent :number = 0
            let totalUninvoicedHoursStudent :number = 0
            let totalInvoicedStudent :number = 0
            let totalInvoicedHoursStudent :number = 0


        return (<div key={index} className="bg-white dark:bg-black shadow-lg w-full p-4 rounded-lg">
            <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="remaining-classes">
                <AccordionTrigger>
                    <div>
                        {cs.student.firstname_parent} {cs.student.lastname_parent} <br/>
                        & {cs.student.firstname_student} {cs.student.lastname_student}
                    </div>
                </AccordionTrigger>
                <AccordionContent>

                <p>Totalt ufakturerte timer fra {cs.student.firstname_parent}: <span className="text-red-400">{totalUninvoicedHoursStudent}h, {totalUninvoicedStudent}kr.</span></p>
                <br/>
                <p>Total fakturerte timer fra {cs.student.firstname_parent}: <span className="text-green-400">{totalInvoicedHoursStudent}h, {totalInvoicedStudent}kr.</span></p>
                <br/>


                <Table>
                    <TableCaption>Kronologisk oversikt over alle timer til {cs.student.firstname_parent}</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Dato</TableHead>
                            <TableHead>Varighet</TableHead>
                            <TableHead>Fakturert elev</TableHead>
                            <TableHead className="text-right">Fakturert beløp</TableHead>
                            <TableHead>Betalt lærer</TableHead>
                            <TableHead>Kommentar fra timen</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {classes.map( (c :Classes, index) => {
                        const startedAt: Date = new Date(c.started_at);
                        const endedAt: Date = new Date(c.ended_at);
                        const totalDurationMillis: number = endedAt.getTime() - startedAt.getTime();
                        const durationHours: number = Math.floor(totalDurationMillis / (1000 * 60 * 60));
                        const durationMinutes: number = Math.round((totalDurationMillis % (1000 * 60 * 60)) / (1000 * 60));
                        const invoiceAmount: number = durationHours * 540 + (durationMinutes / 60) * 540;

                        if (!c.invoiced_student) {
                            totalUninvoicedHoursStudent += durationHours + Math.round(durationMinutes/60)
                            totalUninvoicedStudent += invoiceAmount
                            totalAmount += invoiceAmount
                        }
                        else {
                            totalInvoicedHoursStudent += durationHours + Math.round(durationMinutes/60)
                            totalInvoicedStudent += invoiceAmount
                        }
                        
                        return (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{c.started_at}</TableCell>
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
                        </TableRow>
                        );
                    })}
                    </TableBody>
                </Table>
                </AccordionContent>
            </AccordionItem>
            </Accordion>
        </div>)
        })}
    </div>
  );
}