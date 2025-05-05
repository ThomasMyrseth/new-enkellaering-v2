"use client"

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
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Student, ClassesJoinTeacher } from "../admin/types";

export function PreviousClasses({student} : {student : Student}) {     
    const token = localStorage.getItem('token') 
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080' 
    const router = useRouter()

    const [classes, setClasses] = useState<ClassesJoinTeacher[]>();
    const [firstTenClasses, setFirstTenclasses] = useState<ClassesJoinTeacher[]>()
    const [remainingClasses, setRemainingClasses] = useState<ClassesJoinTeacher[]>()
    const [loading, setLoading] = useState<boolean>(true)
    let totalAmount :number = 0

    let hoursOfClassesLastFourWeeks :number = 0
    const now = new Date()
    const fourWeeksAgo = new Date(now)
    fourWeeksAgo.setDate(now.getDate() - 28); // Subtract 21 days

    //get classes for student
    useEffect( () => {
        if (!token) {
            router.push('/login')
        }

        async function fetchClasses() {
            const response = await fetch(`${BASEURL}/get-classes-for-student`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
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

    if (classes) {
        //sort classes cronologically by started at
        classes.sort((a, b) => {
            const dateA = new Date(a.started_at);
            const dateB = new Date(b.started_at);
            return dateB.getTime() - dateA.getTime();
        });

        classes.forEach(c => {
            const totalDurationMillis: number = new Date(c.ended_at).getTime() - new Date(c.started_at).getTime();
            const durationHours = (new Date(c.ended_at).getTime() - new Date(c.started_at).getTime()) / (1000 * 60 * 60)
            if (!c.invoiced_student) {
                if (c.groupclass) {
                    totalAmount += durationHours*350
                }
                else {
                    totalAmount += durationHours*540;
                }
            }

            //add it to the threeweek
            if (new Date(c.started_at).getTime() > fourWeeksAgo.getTime()) {
                hoursOfClassesLastFourWeeks += totalDurationMillis / (1000*60*60)
            }
        })

        hoursOfClassesLastFourWeeks = Math.round(hoursOfClassesLastFourWeeks*10)/10

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

      
    return (<div className="flex flex-col justify-center items-center w-full bg-white dark:bg-black rounded-lg p-4">
        <h2>En oversikt over tidligere timer</h2>
        <div className="m-4 p-4 rounded-sm bg-neutral-100 dark:bg-neutral-900">
        <p className="text-sm text-neutral-500 dark:text-neutral-200">De siste fire ukene har dere totalt hatt {hoursOfClassesLastFourWeeks} timer
            <br/>
            Dere sikter dere mot {student.est_hours_per_week} timer per uke, {student.est_hours_per_week*4} timer per måned
        </p>
        </div>
        <Table>
        <TableCaption>*At en time er fakturert vil si at faktura for timen er sendt ut, det betyr ikke at timen er betalt
            <br/>*At en rad er rød vil si at den ble avbestilt mindre enn 24 timer før timen skulle utføres.
        </TableCaption>
        <TableHeader>
            <TableRow>
                <TableHead className="w-[100px]">Dato</TableHead>
                <TableHead>Lærer</TableHead>
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

                let amount: number = durationHours * 540 + (durationMinutes / 60) * 540; // Adding fractional hours

                if (c.groupclass) {
                    amount = durationHours * 350 + (durationMinutes / 60) * 350; // Adding fractional hours
                }

                return(
                    <TableRow key={index} className={`${c.was_canselled===true? 'bg-red-50 dark:bg-red-950' : ''}`}>
                        <TableCell className="font-medium">{c.started_at}</TableCell>
                        <TableCell>{c.firstname} {c.lastname}</TableCell>
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

                    let amount: number = durationHours * 540 + (durationMinutes / 60) * 540; // Adding fractional hours
                    if (c.groupclass) {
                        amount = durationHours * 350 + (durationMinutes / 60) * 350; // Adding fractional hours
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
