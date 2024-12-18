"use client"
import React, { useRef } from "react";

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

import { Copy } from 'lucide-react';


import { Classes, Student } from "./types";

import { useEffect, useState } from "react"


const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;



type ClassesJoinStudent = {
    classes: Classes[];
    student: Student;
}

export function PreviousClassesForEachStudent({admin_user_id}: {admin_user_id: string}) {      

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
                    "admin_user_id": admin_user_id
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
    
    },[admin_user_id])

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
                    "admin_user_id": admin_user_id
                })
            })

            if (!response.ok) {
                alert("Error fetching students " + response.statusText)
                setStudents([])
                return null
            }

            const data = await response.json()
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
    },[BASEURL, admin_user_id])


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
        <h1 className="text-xl">En oversikt over tidligere time for hver elev</h1>

        {classesByStudents.map((cs :ClassesJoinStudent, index) => {
            const classes :Classes[] = cs.classes

            //sortng classes by startedAt
            classes.sort((a, b) => {
                const dateA = new Date(a.started_at);
                const dateB = new Date(b.started_at);
                return dateA.getTime() - dateB.getTime();
            });

            //calculate total univoiced ammount
            let totalUninvoicedStudent :number = 0
            let totalUninvoicedHoursStudent :number = 0
            let totalInvoicedStudent :number = 0
            let totalInvoicedHoursStudent :number = 0

            classes.map( (c :Classes, index) => {
                const startedAt: Date = new Date(c.started_at);
                const endedAt: Date = new Date(c.ended_at);
                const totalDurationMillis: number = endedAt.getTime() - startedAt.getTime();
                const durationHours: number = Math.floor(totalDurationMillis / (1000 * 60 * 60));
                const durationMinutes: number = Math.round((totalDurationMillis % (1000 * 60 * 60)) / (1000 * 60));
                const totalDurationHours: number = durationHours + durationMinutes / 60; // Combine fractional hours
            
                const invoiceAmount: number = totalDurationHours * 540;
             
                if (!c.invoiced_student) {
                    totalUninvoicedHoursStudent += totalDurationHours; // Add fractional hours directly
                    totalUninvoicedStudent += invoiceAmount;
                } else {
                    totalInvoicedHoursStudent += totalDurationHours;
                    totalInvoicedStudent += invoiceAmount;
                }
            })


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
                <p>Total fakturerte timer fra {cs.student.firstname_parent}: <span className="text-green-400">{totalInvoicedHoursStudent}h, {totalInvoicedStudent}kr.</span></p>

                <InvoiceStudentPopover student={cs.student} classes={cs.classes} admin_user_id={admin_user_id}/>

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
                        const totalDurationHours: number = durationHours + durationMinutes / 60; // Combine fractional hours
                    
                        const invoiceAmount: number = totalDurationHours * 540;
                        
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









import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const InvoiceStudentPopover = ( {student, classes, admin_user_id} : {student: Student, classes: Classes[], admin_user_id: string}) => {

    const [success, setSuccess] = useState<boolean | null>(null)
    let numberOfClassesToInvoice :number= 0
    const [clickedCopy, setClickedCopy] = useState<boolean>(false)

    const monthsInNorwegian = [
        "januar", "februar", "mars", "april", "mai", "juni",
        "juli", "august", "september", "oktober", "november", "desember"
    ];
    // Get current date
    const currentDate = new Date();
    const currentMonth: string = monthsInNorwegian[currentDate.getMonth()];
    const currentYear: number = currentDate.getFullYear();
    
    //Invoice ammount
    let totalInvoiceAmmount :number = 0
    let totalNumberOfHours :number = 0
    //clasIds to be marked as invoiced
    const classIds :string[] = []


    classes.map((c: Classes, index) => {
        //skip already invoiced classes
        if (c.invoiced_student) {
            return null;
        }

        //add the class to the list of classes to be invoiced
        classIds.push(c.class_id)
        numberOfClassesToInvoice += 1
        
        //calculate invoice ammmount
        const startTime: string = c.started_at;
        const endTime: string = c.ended_at;

        // Calculate duration in hours and round to one decimal place
        let durationHours = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
        durationHours = Math.round(durationHours * 10) / 10; // Rounds to one decimal place

        totalNumberOfHours += durationHours;
        totalInvoiceAmmount += Math.round(durationHours * 540);
    });

    //mark the classes as invoiced
    const handleSetClassesToInvoiced = async () => {
        const res = await fetch(`${BASEURL}/set-classes-to-invoiced`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json", // Corrected header key
            },
            body: JSON.stringify({
                "admin_user_id": admin_user_id,
                "class_ids": classIds
            })
        })

        if (res.status==401) {
            alert("Alle timer er allerede satt som fakturert!")
        }

        else if (!res.ok){
            setSuccess(false)
            alert("En feil har skjedd. Kunne ikke sette timene til fakturert!")
        }

        else {
            setSuccess(true)
        }
    }

    const contentRef = useRef<HTMLDivElement>(null);

    const copyToClipboard = () => {
        if (contentRef.current) {
            // Get the text content of the ref
            const content = contentRef.current.innerText;
            navigator.clipboard.writeText(content).then(() => {
                setClickedCopy(true)
            }).catch(err => {
                setClickedCopy(false)
                alert("error copying text")
                console.error("Failed to copy text: ", err);
            });
        }
    };


    return (
        <Popover>
        <PopoverTrigger asChild>
            <Button variant="outline">Send faktura til {student.firstname_parent} {student.lastname_parent}</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
            {success===true && <p className="text-green-400">Timene er satt til fakturert</p>}
            {success===false && <p className="text-red-400">En feil har skjedd, prøv igjen</p>}

            <div ref={contentRef}>
                <p>
                    Faktura for privatundervisning i {currentMonth} {currentYear}
                    <br/>
                    Total {totalNumberOfHours} timer, {totalInvoiceAmmount} kroner, fordelt på {numberOfClassesToInvoice} ganger
                    <br/>
                </p>
                
                <div className="">
                    {classes.map((c :Classes, index) => {
                        //skip already invoiced classes
                        if (c.invoiced_student) {
                            return null;
                        }

                        //add the class to the list of classes to be invoiced
                        classIds.push(c.class_id)
                        numberOfClassesToInvoice += 1
                        
                        //calculate invoice ammmount
                        const startTime: string = c.started_at;
                        const endTime: string = c.ended_at;
                        // Format to Norwegian time
                        const formatDateTime = (dateString: string): string => {
                            const date = new Date(dateString);
                            return new Intl.DateTimeFormat("nb-NO", {
                                weekday: "short",
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }).format(date);
                        };

                        const formattedStartTime = formatDateTime(startTime);
                        const formattedEndTime = formatDateTime(endTime);

                        return (<div key={index}>
                        <p>
                            Fra {formattedStartTime} til {formattedEndTime} <br/>
                        </p>
                        </div>)
                    })
                    }
                </div>

            </div>

            <div className=" flex flex-row space-x-4 justify-start mt-5">
                <Button onClick={copyToClipboard} disabled={clickedCopy}>
                    <Copy/>
                </Button>
                <Button onClick={handleSetClassesToInvoiced} disabled={success===true || numberOfClassesToInvoice===0}>Sett timene til fakturert</Button>
            </div>
        </PopoverContent>
        </Popover>
    )
}
