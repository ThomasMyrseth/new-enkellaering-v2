
"use client"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

import { Teacher, Classes, Student } from "../admin/types"

const formatToNorwegian = (utcString: string) => {
  return new Date(utcString).toLocaleString("no-NO", {
    weekday: "long",
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function YourStudent( {teacher, classes, students} : {teacher: Teacher, classes :Classes[], students :Student[]}) {
    
    if (!teacher || !students) {
        return (<p>Loading...</p>)
    }

    

    return(<div className="w-full bg-white dark:bg-black rounded-lg p-4 flex flex-col justify-center items-center">
        <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">Dine elever</h2>
        <Accordion type="single" collapsible className="w-full">
            {students.map( (student, index) => {

                let totalDurationMillisLastFourWeeks :number = 0
                const fourWeeksAgo = new Date()
                fourWeeksAgo.setDate(fourWeeksAgo.getDate()-28)

                if (student.is_active===false) {
                    return null;
                }

                classes.map( (c :Classes) => {
                    if (c.student_user_id===student.user_id && new Date(c.started_at).getTime() > fourWeeksAgo.getTime()) {
                        const durationMillis :number = new Date(c.ended_at).getTime() - new Date(c.started_at).getTime()
                        totalDurationMillisLastFourWeeks += durationMillis
                    }
                })

                const totalDurationHours = Math.round(totalDurationMillisLastFourWeeks/(1000*60*60)*10)/10

                return (
                <AccordionItem value={index.toString()} key={index}>
                    <AccordionTrigger>
                        <div className="flex flex-row justify-between w-full mr-4">
                            <p className="text-left md:text-center w-3/4 md:w-1/2">{student.firstname_parent} {student.lastname_parent}
                                <br/>
                                & {student.firstname_student} {student.lastname_student}
                            </p>
                            <p className={`w-1/4 md:w-full text-right ${totalDurationHours < student.est_hours_per_week*4 ? "text-red-400" : "text-neutral-400"}`}>{totalDurationHours}/{student.est_hours_per_week*4}h de siste fire ukene</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="w-full">
                      <div className="flex flex-col justify-center items-start w-full ml-10 p-4">
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
                      </div>

                        <PreviousClasses student={student} teacher={teacher} allClasses={classes} />
                    </AccordionContent>
                </AccordionItem>
                )
                })}
        </Accordion>


    </div>)

}



type FullStudent = {
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
    your_teacher: string,

    is_active :boolean,
    est_hours_per_week :number
}

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { useState, useEffect, useMemo } from "react"
import { DeleteClass } from "./deleteClass"


const PreviousClasses =  ({student, teacher, allClasses}  : {student :FullStudent, teacher :Teacher, allClasses :Classes[]})  => {     

    const sortedFilteredClasses = useMemo(() => {
      return allClasses
        .filter(c => c.student_user_id === student.user_id)
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
    }, [allClasses, student.user_id]);

    const firstTenClasses = sortedFilteredClasses.slice(0, 10);
    const remainingClasses = sortedFilteredClasses.slice(10);

    return (<div className="flex flex-col justify-center items-center w-full bg-white dark:bg-black rounded-lg p-4">
        <Table>
        <TableCaption>Tidligre timer med {student.firstname_student}</TableCaption>
        <TableHeader>
            <TableRow>
                <TableHead className="w-[100px]">Dato</TableHead>
                <TableHead>Varighet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Beløp</TableHead>
                <TableHead>Kommentar</TableHead>
                <TableHead>Slett</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {firstTenClasses && firstTenClasses.map((c, index) => {
                const startedAt :Date = new Date(c.started_at); // Convert started_at to a Date object
                const endedAt :Date = new Date(c.ended_at);     // Convert ended_at to a Date object
                
                const totalDurationMillis: number = endedAt.getTime() - startedAt.getTime();
                const durationHours: number = Math.floor(totalDurationMillis / (1000 * 60 * 60)); // Whole hours
                const durationMinutes: number = Math.round((totalDurationMillis % (1000 * 60 * 60)) / (1000 * 60)); // Remaining minutes

                let amount: number = Math.round( (durationHours * parseInt(teacher.hourly_pay) + (durationMinutes / 60) * parseInt(teacher.hourly_pay)) ); // Adding fractional hours
                if (c.groupclass) {
                    const numberOfStudents: number = c.number_of_students || 1;
                    amount = Math.round( (durationHours * (parseInt(teacher.hourly_pay)+60) + (durationMinutes / 60) * (parseInt(teacher.hourly_pay)+60))/numberOfStudents )
                    console.log(`Number of students: ${numberOfStudents}, Amount: ${amount}`)
                }

                return(
                    <TableRow key={index} className={`${c.was_canselled===true ? 'bg-red-50 dark:bg-red-950' : ''}`}>
                        <TableCell className="font-medium">{formatToNorwegian(c.started_at)}</TableCell>
                        <TableCell>{`${durationHours}t ${Math.round(durationMinutes % 60)}min`}</TableCell>
                        <TableCell>{c.paid_teacher ? <p className="text-green-400">Betalt</p> : <p className="text-red-400">Ubetalt</p>}</TableCell>
                        <TableCell className="text-right">{amount}</TableCell>
                        <TableCell>{c.comment}</TableCell>
                        <TableCell><DeleteClass classId={c.class_id} hasInvoiced={c.invoiced_student} hasPaid={c.paid_teacher}/></TableCell>
                    </TableRow>
                )
            })}
        </TableBody>
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

                    let amount: number = Math.round( durationHours * parseInt(teacher.hourly_pay) + (durationMinutes / 60) * parseInt(teacher.hourly_pay) ); // Adding fractional hours
                    if (c.groupclass) {
                        amount = Math.round( durationHours * (parseInt(teacher.hourly_pay)+60) + (durationMinutes / 60) * (parseInt(teacher.hourly_pay)+60) )
                    }

                    return (
                      <TableRow key={index} className={`${c.was_canselled ? 'bg-red-50 dark:bg-red-950' : ''}`}>
                        <TableCell className="font-medium">{c.started_at}</TableCell>
                        <TableCell>{`${durationHours}t ${durationMinutes}min`}</TableCell>
                        <TableCell>
                          {c.invoiced_student ? (
                            <p className="text-green-400">Betalt</p>
                          ) : (
                            <p className="text-red-400">Ubetalt</p>
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

