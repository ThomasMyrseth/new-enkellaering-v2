"use client"

import { Copy } from 'lucide-react';

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

import { Classes, Teacher, Student } from "./types";

import { useEffect, useState } from "react"
import React, { useRef } from "react";


const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;



type classesJoinTeacher = {
    classes: Classes[];
    teacher: Teacher;
}

export function PreviousClassesForEachTeacher() {      
    const token = localStorage.getItem('token')

    const [classes, setClasses] = useState<Classes[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [classesByTeacher, setClassesByTeacher] = useState<classesJoinTeacher[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    

    const [loading, setLoading] = useState<boolean>(true)

    //get classes for everyone
    useEffect( () => {
        async function fetchClasses() {
            const response = await fetch(`${BASEURL}/get-all-classes`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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

        async function getAllTeachers() {

            const response = await fetch(`${BASEURL}/get-all-teachers`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                alert("Error fetching teachers " + response.statusText)
                setTeachers([])
                return null
            }

            const data = await response.json()
            const teachers :Teacher[] = data.teachers

            if (teachers.length===0) {
                alert("No teachers found")
                console.log("No teachers found")
                setTeachers([])
                return null
            }

            else {
                setTeachers(teachers)
            }
        }
        getAllTeachers()

        async function getAllStudents() {

            const response = await fetch(`${BASEURL}/get-all-students`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
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

    
    },[])

    // //get all the teachers
    // useEffect( () => {
    //     async function getAllTeachers() {

    //         const response = await fetch(`${BASEURL}/get-all-teachers`, {
    //             method: "GET",
    //             credentials: "include",
    //             headers: {
    //                 "Content-Type": "application/json"
    //             }
    //         })

    //         if (!response.ok) {
    //             alert("Error fetching teachers " + response.statusText)
    //             setTeachers([])
    //             return null
    //         }

    //         const data = await response.json()
    //         const teachers :Teacher[] = data.teachers

    //         if (teachers.length===0) {
    //             alert("No teachers found")
    //             console.log("No teachers found")
    //             setTeachers([])
    //             return null
    //         }

    //         else {
    //             setTeachers(teachers)
    //         }
    //     }

    //     getAllTeachers()
    // },[])

    // //get all the students
    // useEffect( () => {
    //     async function getAllStudents() {

    //         const response = await fetch(`${BASEURL}/get-all-students`, {
    //             method: "GET",
    //             credentials: "include",
    //             headers: {
    //                 "Content-Type": "application/json"
    //             }
    //         })

    //         if (!response.ok) {
    //             alert("Error fetching students " + response.statusText)
    //             setStudents([])
    //             return null
    //         }

    //         const data = await response.json()
    //         const students :Student[] = data.students

    //         if (students.length===0) {
    //             alert("No students found")
    //             console.log("No students found")
    //             setStudents([])
    //             return null
    //         }


    //         else {
    //             setStudents(students)
    //             setLoading(false)
    //         }
    //     }

    //     getAllStudents()
    // },[])

    //map each teacher to his classes
    useEffect( () => {
        
        if (!classes || !teachers) {
            alert("Teachers or classes not found")
        }

        const classesByTeacher :classesJoinTeacher[] = []
        //for each teacher go through every class
        teachers.forEach(t => {
            const classesForTeacher :Classes[] = []
            classes.forEach(c => {
                if (c.teacher_user_id === t.user_id) {
                    classesForTeacher.push(c)
                }
            })
            classesByTeacher.push({
                classes: classesForTeacher,
                teacher: t
            })
        })


        //sort the array alfabetically
        classesByTeacher.sort( (a,b) => {
            return a.teacher.firstname.localeCompare(b.teacher.firstname, undefined, {
                sensitivity: "base",
              });
        })
        setClassesByTeacher(classesByTeacher)

    },[classes, teachers])

    if (loading) {
        return <p>Loading...</p>
    }

      
    return (<div className="flex flex-col justify-center items-center w-full">
        <h1 className="text-xl">En oversikt over tidligere timer for hver lærer</h1>

        {classesByTeacher.map((ct :classesJoinTeacher, index) => {
            const classes :Classes[] = ct.classes
            



            //sortng classes by startedAt
            classes.sort((a, b) => {
                const dateA = new Date(a.started_at);
                const dateB = new Date(b.started_at);
                return dateA.getTime() - dateB.getTime();
            });


            const teacherHourlyPay :number = parseInt(ct.teacher.hourly_pay)
            let totalUnpaidToTeacher :number = 0
            let totalUnpaidHoursToTeacher :number = 0
            let totalPaidToTeacher :number = 0
            let totalPaidHoursToTeacher :number = 0

            let totalUninvoicedByTeacher :number =0
            let totalUninvoicedHoursByTeacher :number =0
            let totalInvoicedByTeacher :number =0
            let totalInvoicedHoursByTeacher :number =0


            classes.map((c :Classes) => {
                const startedAt: Date = new Date(c.started_at);
                const endedAt: Date = new Date(c.ended_at);
                const totalDurationMillis: number = endedAt.getTime() - startedAt.getTime();
                const durationHours: number = Math.floor(totalDurationMillis / (1000 * 60 * 60));
                const durationMinutes: number = Math.round((totalDurationMillis % (1000 * 60 * 60)) / (1000 * 60));
                const invoiceAmount: number = durationHours * 540 + (durationMinutes / 60) * 540;
                const toTeacherAmmount :number = durationHours * teacherHourlyPay + (durationMinutes / 60) * teacherHourlyPay;

                if (!c.invoiced_student) {
                    totalUninvoicedHoursByTeacher += durationHours + Math.round(durationMinutes/60)
                    totalUninvoicedByTeacher += invoiceAmount
                }
                else {
                    totalInvoicedHoursByTeacher += durationHours + Math.round(durationMinutes/60)
                    totalInvoicedByTeacher += invoiceAmount
                }

                if (!c.paid_teacher) {
                    totalUnpaidToTeacher += toTeacherAmmount
                    totalUnpaidHoursToTeacher += durationHours + Math.round(durationMinutes/60)
                }
                else {
                    totalPaidHoursToTeacher += durationHours + Math.round(durationMinutes/60)
                    totalPaidToTeacher += toTeacherAmmount
                }
            })



        return (<div key={index} className="bg-white dark:bg-black shadow-lg w-full p-4 rounded-lg mb-4">
            <Accordion type="single" collapsible className="w-full mt-4">
                <AccordionItem value="remaining-classes">
                    <AccordionTrigger>
                        <div className='flex flex-row w-full items-center justify-between'>
                            <div className='text-start'>{ct.teacher.firstname} {ct.teacher.lastname}</div>
                            <div className='text-start font-extralight mr-2 w-20 text-neutral-400'> { `${parseInt(ct.teacher.postal_code)<4000 ? "Oslo" : "Trondheim"}` }</div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>

                        <p>
                            Tlf: <span className='font-semibold'>{ct.teacher.phone}</span>
                            <br/>
                            Epost: <span className='font-semibold'>{ct.teacher.email}</span>
                            <br/>
                            Adresse: <span className='font-semibold'>{ct.teacher.address}, {ct.teacher.postal_code}</span>
                            <br/>
                            Spesielle forhold: <span className='font-sembibold'>{ct.teacher.additional_comments? "" : ct.teacher.additional_comments }</span>
                        </p>

                        <Accordion type="single" collapsible className="w-full mb-4">
                            <AccordionItem value="your-students">
                                <AccordionTrigger>{ct.teacher.firstname} sine elever</AccordionTrigger>
                                <AccordionContent>
                                    <Accordion type="single" collapsible className="w-full">
                                        {students.map( (student, index) => (
                                            student.your_teacher === ct.teacher.user_id && (
                                            <AccordionItem value={index.toString()} key={index}>
                                                <AccordionTrigger>
                                                    <p>{student.firstname_parent} {student.lastname_parent}
                                                        <br/>
                                                        & {student.firstname_student} {student.lastname_student}
                                                    </p>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <p>
                                                        <h4 className="mb-1 font-semibold">Forelder</h4>
                                                        {student.firstname_parent} {student.lastname_parent}
                                                        <br/>
                                                        Tlf: {student.phone_parent}
                                                        <br/>
                                                        Epost: {student.email_parent}
                                                    </p>
                                                    <br/>
                                                    <p>
                                                        <h4 className="mb-1 font-semibold">Elev</h4>
                                                        {student.firstname_student} {student.lastname_student}
                                                        <br/>
                                                        Tlf: {student.phone_student}
                                                    </p>
                                                    <br/>
                                                    <p>
                                                        <h4 className="mb-1 font-semibold">Info</h4>
                                                        Hovedfag: {student.main_subjects}
                                                        <br/>
                                                        Spesielle forhold: {student.additional_comments}
                                                        <br/>
                                                        Hjemmeadresse: {student.address}
                                                        <br/>
                                                        Postnummer: {student.postal_code}
                                                        <br/>
                                                        {`${student.has_physical_tutoring? 'fysisk undervisning' : 'digital undervisning'}`}
                                                    </p>
                                                </AccordionContent>
                                            </AccordionItem>
                                            )
                                        ))}
                                    </Accordion>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <PayTeacherPopover teacher={ct.teacher} classes={ct.classes} />

                        <p className="my-4">
                            Totalt ufakturerte timer fra {ct.teacher.firstname}: <span className="text-red-400">{totalUninvoicedHoursByTeacher}h, {totalUninvoicedByTeacher}kr.</span> <br/>
                            Totalt ikke betalt til {ct.teacher.firstname}: <span className="text-red-400">{totalUnpaidHoursToTeacher}h, {totalUnpaidToTeacher}kr.</span> <br/>
                            <br/>
                            Total fakturerte timer fra {ct.teacher.firstname}: <span className="text-green-400">{totalInvoicedHoursByTeacher}h, {totalInvoicedByTeacher}kr.</span> <br/>
                            Totalt betalt til {ct.teacher.firstname}: <span className="text-green-400">{totalPaidHoursToTeacher}h, {totalPaidToTeacher}kr.</span>
                        </p>
                    

                        <Table>
                            <TableCaption>Kronologisk oversikt over alle timer til {ct.teacher.firstname}</TableCaption>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Dato</TableHead>
                                    <TableHead>Varighet</TableHead>
                                    <TableHead>Fakturert elev</TableHead>
                                    <TableHead className="text-right">Fakturert beløp</TableHead>
                                    <TableHead>Betalt lærer</TableHead>
                                    <TableHead>Beløp til lærer</TableHead>
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
                                const toTeacherAmmount :number = durationHours * teacherHourlyPay + (durationMinutes / 60) * teacherHourlyPay;
                                
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
                                    <TableCell className="text-right">{toTeacherAmmount}kr</TableCell>
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

const PayTeacherPopover = ( {teacher, classes} : {teacher: Teacher, classes: Classes[] }) => {
    const token = localStorage.getItem('token')

    const [success, setSuccess] = useState<boolean | null>(null)
    let numberOfClassesToPay :number= 0
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
    let totalPaymentAmmount :number = 0
    let totalNumberOfHours :number = 0
    //clasIds to be marked as invoiced
    const classIds :string[] = []


    classes.map((c: Classes) => {
        //skip already invoiced classes
        if (c.paid_teacher) {
            return null;
        }

        //add the class to the list of classes to have been paid
        classIds.push(c.class_id)
        numberOfClassesToPay += 1
        
        //calculate invoice ammmount
        const startTime: string = c.started_at;
        const endTime: string = c.ended_at;

        // Calculate duration in hours and round to one decimal place
        let durationHours = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
        durationHours = Math.round(durationHours * 10) / 10; // Rounds to one decimal place

        totalNumberOfHours += durationHours;
        totalPaymentAmmount += Math.round(durationHours * parseInt(teacher.hourly_pay));
    });

    //mark the classes as invoiced
    const handleSetClassesToPaid = async () => {
        const res = await fetch(`${BASEURL}/set-classes-to-paid`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json", // Corrected header key
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                "class_ids": classIds
            })
        })

        if (res.status==401) {
            alert("Alle timer er allerede satt som betalt!")
        }

        else if (!res.ok){
            setSuccess(false)
            alert("En feil har skjedd. Kunne ikke sette timene til betalt!")
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
            <Button>Betal {teacher.firstname} {teacher.lastname}</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
            {success===true && <p className="text-green-400">Timene er satt til betalt</p>}
            {success===false && <p className="text-red-400">En feil har skjedd, prøv igjen</p>}

            <div ref={contentRef}>
                <p>
                    Lønn for {currentMonth} {currentYear}
                    <br/>
                    Total {totalNumberOfHours} timer, {totalPaymentAmmount} kroner, fordelt på {numberOfClassesToPay} ganger
                    <br/>
                </p>
                
                <div className="">
                    {classes.map((c :Classes, index) => {
                        //skip already invoiced classes
                        if (c.paid_teacher) {
                            return null;
                        }

                        //add the class to the list of classes to be invoiced
                        classIds.push(c.class_id)
                        
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
                <Button onClick={handleSetClassesToPaid} disabled={success===true || numberOfClassesToPay===0}>Sett timene til betalt</Button>
            </div>
        </PopoverContent>
        </Popover>
    )
}