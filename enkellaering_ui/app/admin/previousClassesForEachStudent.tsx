"use client"
import React from "react";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

import { Classes, Student, Teacher } from "./types";
import { TeacherStudent } from "@/types/teacher-student";

import { useMemo } from "react"
import { useClasses } from "@/hooks/use-classes"
import { useStudents } from "@/hooks/use-students"
import { useTeachers } from "@/hooks/use-teachers"
import { useTeacherStudent } from "@/hooks/use-teacher-student"

import { StudentAccordionHeader } from "./components/studentAccordionHeader"
import { RemoveTeacherDialog } from "./components/removeTeacherDialog"
import { SetTeacherCombobox } from "./components/setTeacherCombobox"
import { StudentNotes } from "./components/studentNotes"
import { InvoiceStudentPopover } from "./components/invoiceStudentPopover"
import { DiscountPopover } from "./components/discountPopover"
import { SetStudentInactive } from "./components/setStudentInactive"
import { ClassHistoryTable } from "./components/classHistoryTable"
import { computeClassTotals } from "./components/calculations"
import { apiFetch } from "@/lib/api"


export function PreviousClassesForEachStudent() {

    const [classes, classesLoading, classesError, setClasses] = useClasses();
    // Students without an accepted, non-resigned teacher are excluded here — they only show up in StudentsWithoutAnyTeachers
    const [rawStudents, studentsLoading, studentsError, setRawStudents] = useStudents(true);
    const [rawTeachers, teachersLoading, teachersError] = useTeachers(true);
    const [teacherStudents, tsLoading, tsError] = useTeacherStudent();
    const loading = classesLoading || studentsLoading || teachersLoading || tsLoading;

    if (classesError) toast.error("Error fetching classes: " + classesError);
    if (studentsError) toast.error("Error fetching students: " + studentsError);
    if (teachersError) toast.error("Error fetching teachers: " + teachersError);
    if (tsError) toast.error("Error fetching teacher-student relationships: " + tsError);

    //order alfabetically, same ordering as the previous manual fetch implementation
    const teachers = useMemo(() => {
        return [...rawTeachers].sort((a: Teacher, b: Teacher) => {
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
    }, [rawTeachers]);

    const students = useMemo(() => {
        return [...rawStudents].sort((a: Student, b: Student) => {
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
    }, [rawStudents]);


    if (loading) {
        return <p>Loading...</p>
    }

    const handleStudentSetInactive = (studentUserId: string) => {
        setRawStudents(prev => prev.map(s => s.user_id === studentUserId ? { ...s, is_active: false } : s))
    }

    const handleDiscountUpdated = (studentUserId: string, discount: number) => {
        setRawStudents(prev => prev.map(s => s.user_id === studentUserId ? { ...s, discount } : s))
    }

    const handleClassDeleted = (classId: string) => {
        setClasses(prev => prev.filter(c => c.class_id !== classId))
    }


    return (<div className="flex flex-col justify-center items-center w-full shadow-lg p-4 bg-white dark:bg-black rounded-lg">
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
                .filter((ts) => {return ts.student?.user_id === s.user_id && ts.relation.teacher_accepted_student==true})
                .map((ts) => ts.teacher?.user_id)
                .filter((id): id is string => id != null);

            const myTeachers: Teacher[] = teachers.filter((t) =>
                myTeacherUserIds.includes(t.user_id) && t.resigned === false
            );

            const {
                totalUninvoicedStudent,
                totalUninvoicedHoursStudent,
                totalInvoicedStudent,
                totalInvoicedHoursStudent,
                totalTravelPayFromStudent,
            } = computeClassTotals(myClasses, teacherStudents)

        return (<div key={index} className="bg-white dark:bg-black w-full p-4 rounded-lg mb-4">
            <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="remaining-classes">
                <StudentAccordionHeader student={s} myClasses={myClasses} />
                <AccordionContent>

                    {!myTeachers.length &&
                        <p className="m-4" key={index}>{s.firstname_parent} har ingen lærer</p>
                    }
                    <div className="w-full justify-between flex">
                        <div className="flex flex-row space-x-2 m-4">
                            {myTeachers.map( (t) => {
                                return <RemoveTeacherDialog teacher={t} key={t.user_id} student={s} teacherStudent={teacherStudents.find(
                                    (ts: TeacherStudent) => ts.student?.user_id === s.user_id && ts.teacher?.user_id === t.user_id
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

                <p>Totalt ufakturerte timer fra {s.firstname_parent}: <span className="text-red-400">{totalUninvoicedHoursStudent}h, {totalUninvoicedStudent * (1 - (s.discount ?? 0)) + totalTravelPayFromStudent}kr. (inkludert reisetillegg)</span></p>
                <p>Total fakturerte timer fra {s.firstname_parent}: <span className="text-green-400">{totalInvoicedHoursStudent}h, {totalInvoicedStudent}kr.</span></p>

                <div className="flex flex-row w-full justify-between pt-2">
                    <InvoiceStudentPopover student={s} classes={myClasses} teacherStudents={teacherStudents}/>
                    <div className="flex flex-row space-x-2">
                        <DiscountPopover student={s} onDiscountUpdated={handleDiscountUpdated} />
                        <SetStudentInactive student={s} onSetInactive={handleStudentSetInactive} />
                    </div>
                </div>

                <ClassHistoryTable
                    classes={myClasses}
                    teachers={teachers}
                    teacherStudents={teacherStudents}
                    studentFirstName={s.firstname_parent}
                    onClassDeleted={handleClassDeleted}
                />
                </AccordionContent>
            </AccordionItem>
            </Accordion>
        </div>)
        })}
    </div>
  );
}

const handleAddNewTeacher = async (teacherUserId :string, studentUserId :string) => {
    try {
        await apiFetch("/assign-teacher-for-student", {
            method: "POST",
            body: {
                teacher_user_id: teacherUserId,
                student_user_id: studentUserId
            }
        })
        toast.success("Læreren er blitt tildelt til eleven")
    } catch (error) {
        toast.error(`Error while assigning teacher to student: ${error}`)
    }
}
