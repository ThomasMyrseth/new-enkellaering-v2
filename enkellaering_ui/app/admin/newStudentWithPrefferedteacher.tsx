"use client"

import React, { useState, useEffect } from "react"
import { StudentsWithoutTeacher } from "./types"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { toast } from "sonner"

export function NewStudentsWithoutTeacher() {
  const token = localStorage.getItem("token")
  const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080"
  const [loading, setLoading] = useState<boolean>(true)
  const [studentsWithoutTeacher, setStudentsWithoutTeacher] = useState<StudentsWithoutTeacher[]>([])

  // get all new students
  useEffect(() => {
    async function getNewStudents() {
      const response = await fetch(`${BASEURL}/get-new-students-with-preferred-teacher`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        alert("Error fetching new students " + response.statusText)
        return null
      }

      const data = await response.json()
      const s = data.students_without_teacher

      setStudentsWithoutTeacher(s)
      setLoading(false)
    }

    getNewStudents()
  }, [token, BASEURL])

  if (loading) {
    return <p className="w-full rounded-lg bg-white dark:bg-black m-4 p-4 shadow-lg">Loading...</p>
  }

  if (!studentsWithoutTeacher || studentsWithoutTeacher.length === 0) {
    return <p className="w-full rounded-lg bg-white dark:bg-black m-4 p-4 shadow-lg text-center">No new students found</p>
  }

  return (<div className="w-full">
    <h2 className="w-full text-center text-xl md:text-3xl font-semibold mb-4">Elever uten lærer</h2>
    <NewStudentsAccordion studentsWithoutTeacher={studentsWithoutTeacher} />
  </div>)
  
}

type NewStudentsAccordionProps = {
  studentsWithoutTeacher: StudentsWithoutTeacher[]
}

const NewStudentsAccordion = ({ studentsWithoutTeacher }: NewStudentsAccordionProps) => {
  // Group orders by student (assuming "user_id" uniquely identifies the student)
  const grouped = studentsWithoutTeacher.reduce((acc, order) => {
    const key = order.user_id
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(order)
    return acc
  }, {} as Record<string, StudentsWithoutTeacher[]>)

  const studentGroups = Object.values(grouped)

  return (
    <Accordion type="multiple" className="w-full rounded-lg bg-white dark:bg-black m-4 p-4 shadow-lg">
      {studentGroups.map((orders) => (
        <AccordionItem key={orders[0].row_id} value={orders[0].row_id}>
          <AccordionTrigger className="w-full h-full p-4 bg-muted">
            <div className="flex flex-row justify-between items-center w-full pr-2">
              <p className="text-start">
                {orders[0].firstname_parent} {orders[0].lastname_parent} <br />
                {orders[0].phone_parent}
              </p>
              <div className="flex flex-col text-end">
                <p className="text-neutral-400">
                  {(() => {
                    const earliestTimestamp = Math.min(...orders.map(order => new Date(order.created_at).getTime()));
                    const earliestDate = new Date(earliestTimestamp);
                    return new Intl.DateTimeFormat("nb-NO", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }).format(earliestDate);
                  })()}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <StudentTeacherOrdersTable orders={orders} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

type StudentTeacherOrdersTableProps = {
  orders: StudentsWithoutTeacher[]
}

const StudentTeacherOrdersTable = ({ orders }: StudentTeacherOrdersTableProps) => {
  return (
    <div className="">
      <Table>
        <TableCaption>Lærerbestillinger for denne eleven</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Lærer status</TableHead>
            <TableHead>Tlf</TableHead>
            <TableHead>Hvordan</TableHead>
            <TableHead>Hvor</TableHead>
            <TableHead>Kommentarer</TableHead>
            <TableHead>Lærer</TableHead>
            <TableHead>Handling</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TeacherOrderRow key={order.row_id} order={order} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const TeacherOrderRow = ({ order }: { order: StudentsWithoutTeacher }) => {
  const token = localStorage.getItem("token")
  const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080"

  const handleDelete = async () => {
    const response = await fetch(`${BASEURL}/hide-new-student`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        row_id: order.row_id,
      }),
    })

    if (!response.ok) {
      alert("Error while deleting new student")
    } else {
      toast("Eleven er slettet")
    }
  }

  return (
    <TableRow>
      <TableCell>
        {order.teacher_accepted_student === false 
          ? <span className="inline-block h-4 w-4 rounded-full bg-red-500"/> 
          : <span className="inline-block h-4 w-4 rounded-full bg-orange-400"/>}
      </TableCell>
      <TableCell>{order.phone_parent}</TableCell>
      <TableCell>{order.physical_or_digital ? "Fysisk" : "Digitalt"}</TableCell>
      <TableCell>{order.physical_or_digital ? order.preferred_location : "Digitalt"}</TableCell>
      <TableCell>
        <p className="h-20 overflow-y-scroll">{order.order_comments || ""}</p>
      </TableCell>
      <TableCell>
        {order.firstname} {order.lastname} <br />
        {order.phone}
      </TableCell>
      <TableCell>
        <AlertDialog>
          <AlertDialogTrigger>
            <Button className="bg-red-400">Slett</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
              <AlertDialogDescription>Dette kan ikke angres.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Kanseler</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Slett</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  )
}