"use client"
import React, { useRef } from "react";
import { Input } from "@/components/ui/input"

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
import { toast } from "sonner";
import { DeleteClass } from "../min-side-laerer/deleteClass";

import { Copy } from 'lucide-react';

import { Classes, Student, Teacher, TeacherStudent } from "./types";

import { useEffect, useState } from "react"


const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;



export function PreviousClassesForEachStudent() {      
    const token = localStorage.getItem('token') || ''

    const [classes, setClasses] = useState<Classes[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [teacherStudents, setTeacherStudents] = useState<TeacherStudent[]>([]);

    const [loading, setLoading] = useState<boolean>(true)


    //populate data fields
    useEffect( () => {
        async function getData() {
            const t :Teacher[] = await getTeachers(token)
            const s: Student[] = await getStudents(token)
            const c :Classes[] = await getClasses(token)
            const ts: TeacherStudent[] = await getTeacherStudent(token)

            if (t) {
                //order alfabetcically
                t.sort((a: Teacher, b: Teacher) => {
                    const nameA = a.firstname.toUpperCase();
                    const nameB = b.firstname.toUpperCase();
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    return 0;
                });
                setTeachers(t);
            }
            if (s) {
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
                setStudents(s);
            }
            if (c) {
                setClasses(c)
            }
            if (ts) {
                setTeacherStudents(ts)
            }
            setLoading(false)

        }
        getData()
    },[token])


    if (loading) {
        return <p>Loading...</p>
    }

      
    return (<div className="flex flex-col justify-center items-center w-full shadow-lg m-4 p-4 bg-white dark:bg-black rounded-lg">
        <h1 className="text-xl">En oversikt over tidligere time for hver elev</h1>

        {students.map((s :Student, index) => {

            if (s.is_active===false) {
                return null;
            }

            const myClasses :Classes[] = classes.filter( (c) => {return c.student_user_id ===s.user_id}) || []

            //sortng classes by startedAt
            myClasses.sort((a, b) => {
                const dateA = new Date(a.started_at);
                const dateB = new Date(b.started_at);
                return -(dateA.getTime() - dateB.getTime()); //reverse cronological order
            });

            const myTeacherUserIds: string[] = teacherStudents
                .filter((ts) => {return ts.student_user_id === s.user_id && ts.teacher_accepted_student==true})
                .map((ts) => ts.teacher_user_id);

            const myTeachers: Teacher[] = teachers.filter((t) => 
                myTeacherUserIds.includes(t.user_id) && t.resigned === false
            );

            //calculate total univoiced ammount
            let totalUninvoicedStudent :number = 0
            let totalUninvoicedHoursStudent :number = 0
            let totalInvoicedStudent :number = 0
            let totalInvoicedHoursStudent :number = 0
            let totalTravelPayFromStudent :number = 0

            let hoursOfClassesLastFourWeeks : number = 0

            let numberOfCanselledClassesLastFourWeeks :number =0

            myClasses.map( (c :Classes ) => {
                const today :Date = new Date();
                const fourWeeksAgo: Date = new Date(today); // Create a copy of today
                fourWeeksAgo.setDate(today.getDate() - 28); // Subtract 21 days

                const startedAt: Date = new Date(c.started_at);
                const endedAt: Date = new Date(c.ended_at);
                const totalDurationMillis: number = endedAt.getTime() - startedAt.getTime();
                const durationHours: number = Math.floor(totalDurationMillis / (1000 * 60 * 60));
                const durationMinutes: number = Math.round((totalDurationMillis % (1000 * 60 * 60)) / (1000 * 60));
                const totalDurationHours: number = durationHours + durationMinutes / 60; // Combine fractional hours
                
                let invoiceAmount: number = totalDurationHours * 540;
                if (c.groupclass) {
                    invoiceAmount = totalDurationHours * 350
                }
             
                if (!c.invoiced_student) {
                    totalUninvoicedHoursStudent += totalDurationHours; // Add fractional hours directly
                    totalUninvoicedStudent += invoiceAmount;


                    const ts = teacherStudents.find((ts: TeacherStudent) =>
                        ts.student_user_id === c.student_user_id &&
                        ts.teacher_user_id === c.teacher_user_id
                    );
                    const travelPayFromStudent = Number(ts?.travel_pay_from_student || 0)
                    totalTravelPayFromStudent += travelPayFromStudent
                    invoiceAmount += travelPayFromStudent

                } else {
                    totalInvoicedHoursStudent += totalDurationHours;
                    totalInvoicedStudent += invoiceAmount;
                }

                //check if the class is within three weeks of now
                if (startedAt.getTime() > fourWeeksAgo.getTime()) {
                    hoursOfClassesLastFourWeeks += totalDurationMillis/(1000*60*60)
                }

                if (c.was_canselled===true && startedAt.getTime() > fourWeeksAgo.getTime()) {
                    numberOfCanselledClassesLastFourWeeks += 1
                }
            })

            hoursOfClassesLastFourWeeks = Math.round(hoursOfClassesLastFourWeeks*10)/10 //1 decimal
            totalUninvoicedStudent = Math.round(totalUninvoicedStudent)
            totalUninvoicedHoursStudent= Math.round(totalUninvoicedHoursStudent*10)/10
            totalInvoicedStudent = Math.round(totalInvoicedStudent)
            totalInvoicedHoursStudent = Math.round(totalInvoicedHoursStudent*10)/10

        return (<div key={index} className="bg-white dark:bg-black w-full p-4 rounded-lg mb-4">
            <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="remaining-classes">
                <AccordionTrigger className={`w-full h-full p-4 ${numberOfCanselledClassesLastFourWeeks>=2 ? 'bg-red-50 dark:bg-red-950':''}`}>
                    <div className={`flex flex-row justify-between items-center w-full pr-2 }`}>
                        <p className="text-start">
                            {s.firstname_parent} {s.lastname_parent} <br/>
                            & {s.firstname_student} {s.lastname_student} <br/>
                            {s.phone_parent} | {s.phone_student}
                        </p>
                        <div className="flex flex-col">
                            {!myTeachers.length && 
                                <p className="text-red-500">
                                    Mangler lærer
                                </p>
                            }
                            <p className={`
                                    ${hoursOfClassesLastFourWeeks<s.est_hours_per_week*4 ? "text-red-300" : "text-neutral-400"} 
                                `}>
                               {hoursOfClassesLastFourWeeks}/{s.est_hours_per_week*4}h siste fire uker
                            </p>
                            <p className="text-end text-neutral-400">
                                {parseInt(s.postal_code) < 4000 ? "Oslo" : "Trondheim"}
                            </p>
                        </div>
                    </div>
                </AccordionTrigger>
                <AccordionContent>

                    {!myTeachers.length &&
                        <p className="m-4" key={index}>{s.firstname_parent} har ingen lærer</p>
                    }
                    <div className="w-full justify-between flex">
                        <div className="flex flex-row space-x-2 m-4">
                            {myTeachers.map( (t) => {
                                return <RemoveTeacherDialog teacher={t} key={t.user_id} student={s} teacherStudent={teacherStudents.find(
                                    (ts: TeacherStudent) => ts.student_user_id === s.user_id && ts.teacher_user_id === t.user_id
                                )}/>;
                            })}
                        </div>
                        <SetTeacherCombobox student={s} teachers={teachers} passSelectedTeacher={handleAddNewTeacher}/>
                    </div>

                    <StudentNotes student={s}/>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value={`Om ${s.firstname_parent}`} key={1}>
                            <AccordionTrigger>
                                <p>{s.firstname_parent}</p>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p>
                                    <h4 className="mb-1 font-semibold">Forelder</h4>
                                    {s.firstname_parent} {s.lastname_parent}
                                    <br/>
                                    Tlf: {s.phone_parent}
                                    <br/>
                                    Epost: {s.email_parent}
                                </p>
                                <br/>
                                <p>
                                    <h4 className="mb-1 font-semibold">Elev</h4>
                                    {s.firstname_student} {s.lastname_student}
                                    <br/>
                                    Tlf: {s.phone_student}
                                </p>
                                <br/>
                                <p>
                                    <h4 className="mb-1 font-semibold">Info</h4>
                                    Hovedfag: {s.main_subjects}
                                    <br/>
                                    Spesielle forhold: {s.additional_comments}
                                    <br/>
                                    Hjemmeadresse: {s.address}
                                    <br/>
                                    Postnummer: {s.postal_code}
                                    <br/>
                                    {`${s.has_physical_tutoring? 'fysisk undervisning' : 'digital undervisning'}`}
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                </Accordion>

                <p>Totalt ufakturerte timer fra {s.firstname_parent}: <span className="text-red-400">{totalUninvoicedHoursStudent}h, {totalUninvoicedStudent+totalTravelPayFromStudent}kr. (inkludert reisetillegg)</span></p>
                <p>Total fakturerte timer fra {s.firstname_parent}: <span className="text-green-400">{totalInvoicedHoursStudent}h, {totalInvoicedStudent}kr.</span></p>
                                
                <div className="flex flex-row w-full justify-between pt-2">
                    <InvoiceStudentPopover student={s} classes={myClasses} teacherStudents={teacherStudents}/>
                    <SetStudentInactive student={s} />
                </div>

                <Table>
                    <TableCaption>Kronologisk oversikt over alle timer til {s.firstname_parent}</TableCaption>
                    <TableHeader>
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
                    {myClasses.map( (c :Classes, index) => {
                        const startedAt: Date = new Date(c.started_at);
                        const endedAt: Date = new Date(c.ended_at);
                        const totalDurationMillis: number = endedAt.getTime() - startedAt.getTime();
                        const durationHours: number = Math.floor(totalDurationMillis / (1000 * 60 * 60));
                        const durationMinutes: number = Math.round((totalDurationMillis % (1000 * 60 * 60)) / (1000 * 60));
                        const totalDurationHours: number = durationHours + durationMinutes / 60; // Combine fractional hours
                    
                        let invoiceAmount: number = Math.round(totalDurationHours * 540);
                        if (c.groupclass) {
                            invoiceAmount = Math.round(durationHours*350)
                        }
                        invoiceAmount += Number(teacherStudents.find((ts: TeacherStudent) =>
                            ts.student_user_id === c.student_user_id &&
                            ts.teacher_user_id === c.teacher_user_id
                        )?.travel_pay_from_student || 0);
                        
                        const classTeacher = teachers.find(t => t.user_id === c.teacher_user_id);
                        const teacherName = classTeacher ? `${classTeacher.firstname} ${classTeacher.lastname}` : "Ukjent lærer";

                        return (
                        <TableRow key={index} className={`${c.was_canselled===true? 'bg-red-50 dark:bg-red-950' : ''}`}>
                            <TableCell className="font-medium">{c.started_at}</TableCell>
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
                            <TableCell><DeleteClass classId={c.class_id} hasInvoiced={c.invoiced_student} hasPaid={c.paid_teacher}/></TableCell>
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

const handleAddNewTeacher = async (teacherUserId :string, studentUserId :string) => {
    assignTeacher(teacherUserId, studentUserId)
}








import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const InvoiceStudentPopover = ( {student, classes, teacherStudents} : {student: Student, classes: Classes[], teacherStudents :TeacherStudent[]}) => {
    const token = localStorage.getItem('token')

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
    let totalTravelPay :number = 0
    //clasIds to be marked as invoiced
    const classIds :string[] = []


    classes.map((c: Classes) => {
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
        const durationHours = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);

        totalNumberOfHours += durationHours;

        let thisClass :number = durationHours*540
        if (c.groupclass) {
            thisClass = durationHours*350
        }
        totalInvoiceAmmount += thisClass

        const ts = teacherStudents.find((ts: TeacherStudent) =>
            ts.student_user_id === c.student_user_id &&
            ts.teacher_user_id === c.teacher_user_id
        );
        const travelPayFromStudent = Number(ts?.travel_pay_from_student || 0)
        totalTravelPay += travelPayFromStudent
    });

    //now round of total values
    totalInvoiceAmmount = Math.round(totalInvoiceAmmount * 10) / 10;
    totalNumberOfHours = Math.round(totalNumberOfHours * 10) / 10;
    totalTravelPay = Math.round(totalTravelPay * 10) / 10;

    //mark the classes as invoiced
    const handleSetClassesToInvoiced = async () => {
        const res = await fetch(`${BASEURL}/set-classes-to-invoiced`, {
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
            <Button className="bg-blue-900 dark:bg-blue-800 text-white dark:text-white">Send faktura til {student.firstname_parent} {student.lastname_parent}</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
            {success===true && <p className="text-green-400">Timene er satt til fakturert</p>}
            {success===false && <p className="text-red-400">En feil har skjedd, prøv igjen</p>}

            <div ref={contentRef}>
                <p>
                    Faktura for privatundervisning i {currentMonth} {currentYear}
                    <br/>
                    Total {totalNumberOfHours} timer, {totalInvoiceAmmount+totalTravelPay} kroner, fordelt på {numberOfClassesToInvoice} ganger
                    <br/>
                    Derav {totalTravelPay} kroner i reisetillegg
                </p>
                
                <div className="">
                    {classes.map((c :Classes, index) => {
                        //skip already invoiced classes
                        if (c.invoiced_student) {
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
                            Fra {formattedStartTime} til {formattedEndTime}{c.was_canselled? '*':''}<br/>
                        </p>
                        </div>)
                    })
                    }
                </div>
                <br/><p>* vil si at timen ble kansellert mindre enn 24 timer før avtalt oppstart</p>
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

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"


const handleSetInactive = async (student: Student) => {
    const token = localStorage.getItem('token')

    try {
        const response = await fetch(`${BASEURL}/set-student-to-inactive`, {
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

        alert(`${student.firstname_parent} ${student.lastname_parent} er satt til inaktiv`)

    } catch (error) {
        alert(`Failed to set student inactive: ${error}`);
    }
}
const SetStudentInactive = ({ student }: { student: Student }) => {

    return(<>
         <AlertDialog>
            <AlertDialogTrigger><Button className="bg-red-400 dark:bg-red-800 text-white dark:text-white">Sett {student.firstname_parent} som inaktiv</Button></AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Er du sikker på du vil sette denne eleven som inaktiv</AlertDialogTitle>
                <AlertDialogDescription>
                    Dette kan ikke angres. Det blir ikke mulig å føre inn flere timer på eleven. Det blir ikke mulig å fakturere for ubetalte timer.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Kanseler</AlertDialogCancel>
                <AlertDialogAction onClick={ () => handleSetInactive(student)}>Fortsett</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>)
};

import { Textarea } from "@/components/ui/textarea";

const StudentNotes = ({student} : {student : Student}) => {
    const [notes, setNotes] = useState<string>(student.notes)

    const handleAddNotes = (note :string) => {
        setNotes(note)
    }

    return (<div className="flex flex-col my-10">
        <Textarea  
                rows={10} 
                className="w-full mb-2 dark:bg-neutral-800" 
                value={notes} 
                onChange={(e) => handleAddNotes(e.target.value)} 
                id="notes" 
                placeholder="Noter ned generell info om eleven (kun synlig for admin)"
        />
        <Button onClick={() => {saveNotes(notes, student.user_id)} } className="bg-blue-900 dark:bg-blue-900 dark:text-neutral-100">Lagre</Button>
    </div>)
}

const saveNotes = async ( notes :string, studentUserId :string) => {
    const token :string | null= localStorage.getItem('token')

    try {
        const response = await fetch(`${BASEURL}/upload-notes-about-student`, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            student_user_id : studentUserId,
            notes : notes
        }),
        });

        if (!response.ok) {
            throw new Error("An error occurred. Please try again.");
        } 

        toast("Notater lagret")        
        return true
    } catch (error) {
        console.error("Error uploading notes:", error);
        alert("An error occurred. Please try again.");
    }
}



// Function to handle removing a teacher from a student
const handleRemoveTeacher = async (student: Student, teacher: Teacher) => {
    const token = localStorage.getItem('token');
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
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        toast(`${teacher.firstname} ${teacher.lastname} ble fjernet fra ${student.firstname_parent} ${student.lastname_parent}`);
    } catch (error) {
        alert(`Fjerning mislyktes: ${error}`);
    }
};

const handleUpdateTravelPay = async (travelPayToTeacher: number, travelPayFromStudent: number, studentUserId: string, teacherUserId: string) => {
    const token = localStorage.getItem('token');
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
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        toast("Reisetillegg oppdatert");
    } catch (error) {
        alert(`Oppdatering mislyktes: ${error}`);
    }
};

// AlertDialog component to confirm teacher removal
const RemoveTeacherDialog = ({ student, teacher, teacherStudent }: { student: Student, teacher: Teacher, teacherStudent? :TeacherStudent }) => {
    const [travelPayToTeacher, setTravelPayToTeacher] = useState<number>(teacherStudent?.travel_pay_to_teacher || 0);
    const [travelPayFromStudent, setTravelPayFromStudent] = useState<number>(teacherStudent?.travel_pay_from_student || 0);


    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="bg-blue-900 dark:bg-blue-800 rounded-xl text-white dark:text-white">{teacher.firstname} {teacher.lastname}</Button>
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
                            <Input type="number" placeholder="Reisetillegg" className="w-full" value={travelPayFromStudent} onChange={(e) => setTravelPayFromStudent(Number(e.target.value))}                            />
                        </div>

                        <div className="flex flex-col space-y-1 w-full">
                            <Label className="text-sm font-medium ">Reisetillegg betalt til lærer</Label>
                            <Input type="number" placeholder="Reisetillegg" className="w-full" value={travelPayToTeacher} onChange={(e) => setTravelPayToTeacher(Number(e.target.value))}/>
                        </div>
                    </div>

                    <Button onClick={() => {
                            handleUpdateTravelPay(travelPayToTeacher, travelPayFromStudent, student.user_id, teacher.user_id);
                    }}>Lagre</Button>
                    <Button className="bg-red-400 dark:bg-red-400" onClick={() => handleRemoveTeacher(student, teacher)}>Fjern {teacher.firstname} fra {student.firstname_parent}</Button>
                    <AlertDialogCancel>Exit</AlertDialogCancel>
                </AlertDialogContent>
            </AlertDialogContent>
        </AlertDialog>
    );
};


async function getClasses(token :string) {
    const response = await fetch(`${BASEURL}/get-all-classes`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if(!response.ok) {
        alert("En feil har skjedd, prøv igjen");
        return [];
    }

    const data = await response.json();
    return data.classes || [];
}

async function getStudents(token :string) {
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

async function getTeachers(token :string) {
    const response = await fetch(`${BASEURL}/get-all-teachers-inc-resigned`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });

    if (!response.ok) {
        alert("Error fetching teachers and students " + response.statusText);
        return [];
    }

    const data = await response.json();
    const teachers: Teacher[] = data.teachers;

    if (teachers.length === 0) {
        alert("No students found");
        console.log("No students found");
        return [];
    } else {
        return teachers;
    }
}

async function getTeacherStudent(token: string) {
    const response = await fetch(`${BASEURL}/get-teacher-student`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        alert("Error fetching teacher-student relationships: " + response.statusText);
        return [];
    }

    const data = await response.json();
    const teacherStudent: TeacherStudent[] = data.teacher_student;

    if (!teacherStudent || teacherStudent.length === 0) {
        alert("Ingen tilkoblinger funnet");
        console.log("No teacher-student relationships found");
        return [];
    }

    return teacherStudent;
}


const assignTeacher = async (
    teacherUserId: string | null, 
    studentUserId: string, 
  ): Promise<void> => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const token = localStorage.getItem('token');
  
    const response = await fetch(`${baseUrl}/assign-teacher-for-student`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        teacher_user_id: teacherUserId,
        student_user_id: studentUserId
      })
    });
  
    if (!response.ok) {
      alert("Error while assigning teacher to student");
    } else {
      toast("Læreren er blitt tildelt til eleven");
    }
};



import { ChevronsUpDown } from "lucide-react";
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const SetTeacherCombobox = ({
    student,
    teachers,
    passSelectedTeacher
  }: { 
    student: Student, 
    teachers: Teacher[], 
    passSelectedTeacher: ((teacherUserId: string, studentUserId: string) => void)
  }) => {
  
    const [teacherUserId, setTeacherUserId] = useState<string | null>(student.your_teacher || null);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [open, setOpen] = useState<boolean>(false);
    const [showCombobox, setShowCombobox] = useState<boolean>(false);

  
    const getTeacherName = (teacher: Teacher | null) =>
      teacher ? `${teacher.firstname} ${teacher.lastname}` : "Ingen lærer tildelt";
  
    const handleSelectTeacher = (userId: string | null) => {
        if (!userId) {
            alert('Velg en lærer dumbasss')
            return
        }
        setTeacherUserId(userId);
        const selected = userId ? (teachers.find((teacher) => teacher.user_id === userId) || null) : null;
        setSelectedTeacher(selected);
        // Pass the new teacher, student id, and old teacher id to the assign function
        passSelectedTeacher(userId, student.user_id);
    };
  
    return (<>
        {!showCombobox?
             <Button className="bg-blue-900 dark:bg-blue-800 text-white dark:text-white rounded-xl" onClick={() => {setShowCombobox(!showCombobox); setOpen(!open)}}>Legg til ny lærer</Button> :
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-start flex flex-row"
          >
            {getTeacherName(selectedTeacher)}
            <ChevronsUpDown className="opacity-50" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Søk etter lærer..." />
            <CommandList>
              <CommandEmpty>Ingen lærer er tildelt</CommandEmpty>
              <CommandGroup>
                {/* Option to remove teacher */}
                <CommandItem
                  key="no-teacher"
                  value="no-teacher"
                  onSelect={() => {
                    handleSelectTeacher(null);
                    setOpen(false);
                  }}
                >
                  Ingen lærer
                  <Check
                    className={cn(
                      "ml-auto",
                      teacherUserId === null ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
                {teachers.map((teacher) => (
                  <CommandItem
                    key={teacher.user_id}
                    value={teacher.firstname + " " + teacher.lastname}
                    onSelect={() => {
                      handleSelectTeacher(teacher.user_id);
                      setOpen(false);
                    }}
                  >
                    {getTeacherName(teacher)}
                    <Check
                      className={cn(
                        "ml-auto",
                        teacherUserId === teacher.user_id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    }
    </>);
};