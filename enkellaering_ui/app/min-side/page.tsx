"use client"
import { useEffect, useState } from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Image from "next/image";
import { BackgroundLines } from "@/components/ui/background-lines";


const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;

type Student = {
    user_id: string,
    firstname_parent: string,
    lastname_parent: string,
    email_parent: string,
    phone_parent: string,

    firstname_student: string,
    lastname_student: string,
    phone_student: string,

    main_subjects: string,
    address: string,
    postal_code: string,
    has_physical_tutoring: boolean,
    created_at: string,
    additional_comments: string,
    your_teacher: string
}

type Teacher = {
    user_id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    postal_code: string;
    hourly_pay: string;
    resgined: boolean;
    additional_comments: string | null;
    created_at: string;
    admin: boolean;
    resigned_at: string | null;
}

type Classes = {
    comment: string; // Optional comment for the session
    created_at: string; // Timestamp when the record was created (ISO format)
    started_at: string; // Timestamp for when the session started (ISO format)
    ended_at: string; // Timestamp for when the session ended (ISO format)
    invoiced_student: boolean; // Indicates if the student was invoiced
    paid_teacher: boolean; // Indicates if the teacher was paid
};

export default function MinSideStudentPage() {
    const [student, setStudent] = useState<Student>()

    useEffect( () => {
        async function fetchStudent() {
            const response = await fetch(`${BASEURL}/get-student`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
            })

            if (!response.ok) {
                alert("failed to fetch student: " + response.statusText)
            }


            const data = await response.json()
            setStudent(data.student) //returns a single student
        }

        fetchStudent()
    },[])

    if (!student) {
        return (<>
            <p>Loading...</p>
        </>)
    }
    return(<div className="flex flex-col items-center justify-center w-full min-h-screen">
        <StudentName student={student} />
        <BackgroundLines>
            <div className="flex flex-col items-center justify-center w-full h-fit gap-6 bg-white dark:bg-black">
                <MyTeacher />
                <PreviousClasses />
            </div>
        </BackgroundLines>
    </div>)
}

import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";

function StudentName({student} : {student: Student}) {
    const firstname_parent :string = student.firstname_parent
    const lastname_parent :string = student.lastname_parent
    const firstname_student :string = student.firstname_student
    const lastname_student :string = student.lastname_student


    return (<>
        <LampContainer>
            <motion.h1
                initial={{ opacity: 0.5, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
                }}
                className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
            >
                {firstname_parent} {lastname_parent}
                <br />
                & {firstname_student} {lastname_student}
            </motion.h1>
        </LampContainer>
    </>)
}

function MyTeacher() {
    const [loading, setLoading] = useState<boolean>(true)
    const [teacher, setTeacher] = useState<Teacher>()
    const [hasTeacher, setHasTeacher] = useState<boolean>(false)

    useEffect( () => {
        async function fetchTeacher() {
            const response = await fetch(`${BASEURL}/get-teacher-for-student`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (!response.ok) {
                alert("failed to fetch teacher: " + response.statusText)
                return null
            }

            const data = await response.json()
            const teacher = data.teacher
            console.log(teacher)
            
            if (teacher.length === 0) {
                console.log("Student doesn't have a teacher yet");
                setHasTeacher(false);
                setLoading(false)
            }
            else {
                setHasTeacher(true)
                setTeacher(data.teacher)
                setLoading(false)
            }
    }
    fetchTeacher()
    },[])

    if (loading) {
        return <p>Loading...</p>
    }


    return(
        <CardContainer className="inter-var">
            <CardBody className="bg-gray-50 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border  ">
                <CardItem
                    translateZ="50"
                    className="text-xl font-bold text-neutral-600 dark:text-white"
                >
                {hasTeacher ? (
                    <>
                        <span className="font-light">Deres lærer er</span> {teacher?.firstname} {teacher?.lastname}
                    </>
                ) : (
                    <span>Dere har ikke fått oppsatt en lærer enda.</span>
                )}
                </CardItem>
                <CardItem
                    as="p"
                    translateZ="60"
                    className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                >
                    { hasTeacher?
                    <span>
                        <span className="font-light">Telefon: </span><span className="font-bold">{teacher?.phone}  </span>
                        <br />
                        <span className="font-light">Epost: </span><span className="font-bold">{teacher?.email}  </span>
                        <br />
                        <span className="font-light">Adresse: </span><span className="font-bold">{teacher?.address}</span>
                        <br />
                        <span className="font-light">Postnummer: </span><span className="font-bold">{teacher?.postal_code}</span>
                    </span>
                    :
                    <span>Dersom dette vedvarer mer enn noen dager kan dere kontakte: 
                        <br/>
                        <span className="font-bold">Thomas Myrseth tlf: <span className="text-underline">47184744</span></span>
                    </span>
                    }
                </CardItem>
                <CardItem
                translateZ="100"
                rotateX={20}
                rotateZ={-10}
                className="w-full mt-4"
                >
                <Image
                    src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    height="1000"
                    width="1000"
                    className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                    alt="thumbnail"
                />
                </CardItem>
            </CardBody>
    </CardContainer>
  );
}


import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter
} from "@/components/ui/table"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";


function PreviousClasses() {      
    const [classes, setClasses] = useState<Classes[]>();
    const [firstTenClasses, setFirstTenclasses] = useState<Classes[]>()
    const [remainingClasses, setRemainingClasses] = useState<Classes[]>()
    const [loading, setLoading] = useState<boolean>(true)
    let totalAmount :number = 0

    //get classes for student
    useEffect( () => {
        async function fetchClasses() {
            const response = await fetch(`${BASEURL}/get-classes-for-student`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
            })

            if(!response.ok) {
                alert("En feil har skjedd, prøv igjen")
                return null;
            }

            const data = await response.json()
            const classes = data.classes

            if (classes.length === 0) {
                setLoading(false)
            }
            else {
                setClasses(classes)
                setLoading(false)
            }
        }
        fetchClasses()
    
    },[])

    //sort classes cronologically by started at
    if (classes) {
        classes.sort((a, b) => {
            const dateA = new Date(a.started_at);
            const dateB = new Date(b.started_at);
            return dateB.getTime() - dateA.getTime();
        });

        classes.forEach(c => {
            const durationHours = (new Date(c.ended_at).getTime() - new Date(c.started_at).getTime()) / (1000 * 60 * 60)
            if (!c.invoiced_student) {
                totalAmount += durationHours*540;
            }
        })

        //round of to an integer NOK
        totalAmount = Math.round(totalAmount)
    }

    //split classes
    useEffect(() => {
        if (classes) {
            setFirstTenclasses(classes.slice(0, 10));
            setRemainingClasses(classes.slice(10));
        }
        
    }, [classes]); // Only run when `classes` changes


    if (loading) {
        return <p>Loading...</p>
    }

      
    return (<div className="flex flex-col justify-center items-center w-3/4">
        <h2>En oversikt over tidligere timer</h2>
        <Table>
        <TableCaption>*At en time er fakturert vil si at faktura for timen er sendt ut, det betyr ikke at timen er betalt</TableCaption>
        <TableHeader>
            <TableRow>
                <TableHead className="w-[100px]">Dato</TableHead>
                <TableHead>Varighet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Beløp</TableHead>
                <TableHead>Kommentar</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {firstTenClasses && firstTenClasses.map((c, index) => {
                const startedAt :Date = new Date(c.started_at); // Convert started_at to a Date object
                const endedAt :Date = new Date(c.ended_at);     // Convert ended_at to a Date object
                
                const totalDurationMillis: number = endedAt.getTime() - startedAt.getTime();
                const durationHours: number = Math.floor(totalDurationMillis / (1000 * 60 * 60)); // Whole hours
                const durationMinutes: number = Math.round((totalDurationMillis % (1000 * 60 * 60)) / (1000 * 60)); // Remaining minutes
                const amount: number = durationHours * 540 + (durationMinutes / 60) * 540; // Adding fractional hours

                return(
                    <TableRow key={index}>
                        <TableCell className="font-medium">{c.started_at}</TableCell>
                        <TableCell>{`${durationHours}t ${Math.round(durationMinutes % 60)}min`}</TableCell>
                        <TableCell>{c.invoiced_student ? <p className="text-green-400">Fakturert</p> : <p className="text-red-400">Ufakturert</p>}</TableCell>
                        <TableCell className="text-right">{amount}</TableCell>
                        <TableCell>{c.comment}</TableCell>
                    </TableRow>
                )
            })}
        </TableBody>
        <TableFooter>
            <TableRow>
            <TableCell colSpan={3}>Totalt ufakturert</TableCell>
            <TableCell className="text-right">{totalAmount}kr.</TableCell>
            </TableRow>
        </TableFooter>
        </Table>

        {remainingClasses && (
        <Accordion type="single" collapsible className="w-full mt-4">
          <AccordionItem value="remaining-classes">
            <AccordionTrigger>Vis flere timer</AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableBody>
                  {remainingClasses.map((c, index) => {
                    const startedAt: Date = new Date(c.started_at);
                    const endedAt: Date = new Date(c.ended_at);
                    const totalDurationMillis: number = endedAt.getTime() - startedAt.getTime();
                    const durationHours: number = Math.floor(totalDurationMillis / (1000 * 60 * 60));
                    const durationMinutes: number = Math.round((totalDurationMillis % (1000 * 60 * 60)) / (1000 * 60));
                    const amount: number = durationHours * 540 + (durationMinutes / 60) * 540;

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
                        <TableCell className="text-right">{amount}kr</TableCell>
                        <TableCell>{c.comment}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}