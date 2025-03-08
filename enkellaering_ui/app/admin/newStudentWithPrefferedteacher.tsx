"use client"

import React from "react"
import { useState, useEffect } from "react"
import { NewStudentWithPreferredTeacher, Teacher } from "./types"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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



  
  
export function NewStudentsWithPreferredTeacherWorkflow() {
      const token = localStorage.getItem('token')
      const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
      const [loading, setLoading] = useState<boolean>(true)
      const [newStudents, setNewStudents] = useState<NewStudentWithPreferredTeacher[]>()
  
      //get all new students
      useEffect( () => {
          async function getNewStudents() {
              const response = await fetch(`${BASEURL}/get-new-students-with-preferred-teacher`, {
                  method: "GET",
                  headers: {
                      'Authorization': `Bearer ${token}`
                  }
              })
  
              if (!response.ok) {
                  alert("Error fetching new students " + response.statusText)
                  return null
              }
  
              const data = await response.json()
              const newStudents :NewStudentWithPreferredTeacher[] = data.new_students
  
              if (newStudents.length===0) {
                  setLoading(false)
                  setNewStudents([])
                  return null
              }
  
              else {
                  setNewStudents(newStudents)
                  setLoading(false)
              }
          }
  
          getNewStudents()
      },[token])
  
      if (loading ) {
          return <p>Loading...</p>
      }
  
      if (!newStudents) {
          return <p>No new students found</p>
      }
  
  
      return (<NewStudentWithPreferredTeacherTable newStudents={newStudents}/>)
      
  
}


const NewStudentWithPreferredTeacherTable =( {newStudents} : {newStudents : NewStudentWithPreferredTeacher[]})  => {
    const token = localStorage.getItem('token')
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'

    const [teachers, setTeachers] = useState<Teacher[]>([])

    //order newStudents by created_at
    newStudents.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB.getTime() - dateA.getTime();
    });


    //get all the teachers and pass it to newStudentRow
    useEffect( () => {
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
                setTeachers([])
                return null
            }

            else {
                setTeachers(teachers)
            }
        }

        getAllTeachers()
    },[token])

    return (<div className=" w-full sm:w-full bg-white dark:bg-black rounded-sm shadow-lg flex flex-col items-center justify-center">
        <Table>
                <TableCaption>Arbeidsoversikt for ny elev som har bestilt en lærer</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Telefonnummer & dato opprettet</TableHead>
                            <TableHead>Lærer har ringt</TableHead>
                            <TableHead>Elev har svart</TableHead>
                            <TableHead>Lærer takker ja/nei</TableHead>


                            <TableHead>Ny elev har opprettet konto</TableHead>

                            <TableHead>Læreren navn og tlf</TableHead>

                            <TableHead>Ny elev har fullført oppstart</TableHead>

                            <TableHead>Kommentarer</TableHead>
                            <TableHead>Lagre</TableHead>
                            <TableHead>Slett ny elev</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {newStudents.map( ns => {
                            if (ns.hidden) {
                                return null
                            }
                            return <NewStudentWithPreferredTeacherRow key={ns.new_student_id} ns={ns} teachers={teachers}/>
                        })}
                    </TableBody>
                </Table>   
    </div>)
}


function NewStudentWithPreferredTeacherRow({ ns, teachers }: { ns: NewStudentWithPreferredTeacher, teachers :Teacher[] }) {
    const token = localStorage.getItem('token')
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
    
    const [comments, setComments] = useState<string>(ns.comments || '')







    const handleSaveClick = async () => {

        const response = await fetch(`${BASEURL}/update-new-student`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' // Added Content-Type header
            },
            body: JSON.stringify({
                "new_student_id": ns.new_student_id,
                "comments": comments || null,
            })
        })

        if (!response.ok) {
            alert("Error while saving updates to new student")
            return null;
        }
        else {
            alert("Oppdateringer lagret")
        }
        
    }

    const handleDelete = async () => {

        const response = await fetch(`${BASEURL}/hide-new-student`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' // Added Content-Type header
            },
            body: JSON.stringify({
                new_student_id : ns.new_student_id
            })
        })

        if (!response.ok) {
            alert("Error while deleting new student")
            return null;
        }
        else {
            alert("Eleven er slettet")
        }

    }

    return(
            <TableRow>
                <TableCell>
                    {ns.phone} <br />
                    {new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(ns.created_at))}
                </TableCell>
                <TableCell>
                    <span className={ns.teacher_called ? "text-green-400" : "text-red-400"}>
                        {ns.teacher_called ? "Ja" : "Nei"}
                    </span>
                </TableCell>
                <TableCell>
                    <span className={ns.teacher_answered ? "text-green-400" : "text-red-400"}>
                        {ns.teacher_answered ? "Ja" : "Nei"}
                    </span>
                </TableCell>
                <TableCell>
                    <span className={ns.teacher_has_accepted ? "text-green-400" : "text-red-400"}>
                        {ns.teacher_has_accepted ? "Ja" : "Nei"}
                    </span>
                </TableCell>
                <TableCell>
                    <span className={ns.student_signed_up ? "text-green-400" : "text-red-400"}>
                        {ns.student_signed_up ? "Ja" : "Nei"}
                    </span>
                </TableCell>
                <TableCell>
                    {teachers.find(t => t.user_id === ns.preferred_teacher)
                        ? `${teachers.find(t => t.user_id === ns.preferred_teacher)?.firstname || "Ukjent"} ${teachers.find(t => t.user_id === ns.preferred_teacher)?.lastname || ""}`
                        : "Ukjent"}
                    <br />
                    {teachers.find(t => t.user_id === ns.preferred_teacher)?.phone || "Ingen tlf"}
                </TableCell>
                <TableCell>
                    <span className={ns.teacher_has_accepted ? "text-green-400" : "text-red-400"}>
                        {ns.teacher_has_accepted ? "Ja" : "Nei"}
                    </span>
                </TableCell>
                <TableCell>
                    <Textarea placeholder="Noter ned viktig info" value={comments} onChange={(e) => setComments(e.target.value)} rows={4} />
                </TableCell>
                <TableCell>
                    <Button onClick={handleSaveClick}>Lagre</Button>
                </TableCell>
                <TableCell>
                    <AlertDialog>
                        <AlertDialogTrigger><Button className="bg-red-400">Slett</Button></AlertDialogTrigger>
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
