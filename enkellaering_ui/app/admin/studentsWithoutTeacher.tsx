"use client"
import React, { useMemo } from "react"
import { Classes, Student, Teacher } from "./types"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { useStudentsWithoutTeacher } from "@/hooks/use-students-without-teacher"
import { useTeachers } from "@/hooks/use-teachers"
import { useClasses } from "@/hooks/use-classes"
import { useTeacherStudent } from "@/hooks/use-teacher-student"
import { apiFetch } from "@/lib/api"

import { StudentAccordionHeader } from "./components/studentAccordionHeader"
import { SetTeacherCombobox } from "./components/setTeacherCombobox"
import { StudentNotes } from "./components/studentNotes"
import { InvoiceStudentPopover } from "./components/invoiceStudentPopover"
import { DiscountPopover } from "./components/discountPopover"
import { SetStudentInactive } from "./components/setStudentInactive"
import { ClassHistoryTable } from "./components/classHistoryTable"
import { computeClassTotals } from "./components/calculations"


export const StudentsWithoutAnyTeachers = ({token, BASEURL} : {token :string, BASEURL :string}) => {
  const [studentsData, studentsLoading, studentsError, setStudentsData] = useStudentsWithoutTeacher()
  const [teachersData, teachersLoading, teachersError] = useTeachers()
  const [allTeachersData, allTeachersLoading, allTeachersError] = useTeachers(true)
  const [classes, classesLoading, classesError, setClasses] = useClasses()
  const [teacherStudents, tsLoading, tsError] = useTeacherStudent()

  const loading = studentsLoading || teachersLoading || allTeachersLoading || classesLoading || tsLoading
  const error = studentsError || teachersError || allTeachersError || classesError || tsError

  const students = useMemo(() => {
    return [...studentsData].sort((a: Student, b: Student) => {
      const nameA = a.firstname_parent.toUpperCase()
      const nameB = b.firstname_parent.toUpperCase()
      if (nameA < nameB) {
        return -1
      }
      if (nameA > nameB) {
        return 1
      }
      return 0
    })
  }, [studentsData])

  const teachers = useMemo(() => {
    return [...teachersData].sort((a: Teacher, b: Teacher) => {
      const nameA = a.firstname.toUpperCase()
      const nameB = b.firstname.toUpperCase()
      if (nameA < nameB) {
        return -1
      }
      if (nameA > nameB) {
        return 1
      }
      return 0
    })
  }, [teachersData])

  const activeStudentsCount = useMemo(() => {
    return students.filter((s) => s.status === 'active').length
  }, [students])

  if (error) toast.error("Error fetching data: " + error)

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center w-full shadow-lg p-4 bg-white dark:bg-black rounded-lg">
        <Skeleton className="h-6 w-72 mt-4 mb-4" />
        <Skeleton className="h-16 w-full mb-2" />
        <Skeleton className="h-16 w-full mb-2" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  const handleAddNewTeacher = async (teacherUserId: string, studentUserId: string) => {
    try {
      await apiFetch("/assign-teacher-for-student", {
        method: "POST",
        body: {
          teacher_user_id: teacherUserId,
          student_user_id: studentUserId
        }
      })

      toast.success("Læreren er blitt tildelt til eleven")
      setStudentsData(prev => prev.filter(s => s.user_id !== studentUserId))
    } catch (error) {
      toast.error(`Error assigning teacher: ${error}`)
    }
  }

  const handleStudentSetInactive = (studentUserId: string) => {
    setStudentsData(prev => prev.filter(s => s.user_id !== studentUserId))
  }

  const handleDiscountUpdated = (studentUserId: string, discount: number) => {
    setStudentsData(prev => prev.map(s => s.user_id === studentUserId ? { ...s, discount } : s))
  }

  const handleClassDeleted = (classId: string) => {
    setClasses(prev => prev.filter(c => c.class_id !== classId))
  }

  return (
    <div className="flex flex-col justify-center items-center w-full shadow-lg p-4 bg-white dark:bg-black rounded-lg">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="students-without-teacher">
          <AccordionTrigger>
            Elever uten lærer ({activeStudentsCount})
          </AccordionTrigger>
          <AccordionContent>
      {students.map((s: Student, index) => {
        if (s.status !== 'active') {
          return null
        }

        const myClasses: Classes[] = classes.filter((c) => c.student_user_id === s.user_id) || []

        myClasses.sort((a, b) => {
          const dateA = new Date(a.started_at)
          const dateB = new Date(b.started_at)
          return -(dateA.getTime() - dateB.getTime())
        })

        const {
          totalUninvoicedStudent,
          totalUninvoicedHoursStudent,
          totalInvoicedStudent,
          totalInvoicedHoursStudent,
          totalTravelPayFromStudent,
        } = computeClassTotals(myClasses, teacherStudents)

        return (
          <div key={index} className="bg-white dark:bg-black w-full p-4 rounded-lg mb-4">
            <Accordion type="single" collapsible className="w-full mt-4">
              <AccordionItem value="student-details">
                <StudentAccordionHeader student={s} myClasses={myClasses} />
                <AccordionContent>
                  <div className="w-full justify-between flex">
                    <div className="flex flex-row space-x-2 m-4">
                      <p className="text-neutral-500">Ingen lærer tildelt</p>
                    </div>
                    <SetTeacherCombobox
                      student={s}
                      teachers={teachers}
                      passSelectedTeacher={handleAddNewTeacher}
                    />
                  </div>

                  <StudentNotes student={s} />

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
                    teachers={allTeachersData}
                    teacherStudents={teacherStudents}
                    studentFirstName={s.firstname_parent}
                    onClassDeleted={handleClassDeleted}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )
      })}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
