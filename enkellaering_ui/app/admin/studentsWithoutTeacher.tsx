"use client"
import React, { useState, useEffect } from "react"
import { Student } from "./types"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


export const StudentsWithoutAnyTeachers = ({token, BASEURL} : {token :string, BASEURL :string}) => { 
  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    async function getNewStudents() {
      const response = await fetch(`${BASEURL}/get-student-without-teacher`, {
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
      const s = data.students

      //order the students alfabetically
      s.sort( (a :Student, b :Student) => {
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

      setStudents(s)
    }

    getNewStudents()
  }, [token, BASEURL])

  return (<>
    <div className="w-full bg-white rounded-lg shadow-md p-4 dark:bg-black">
      <Table>
        <TableCaption>Elever uten lærer, inaktive elever vises ikke her</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Forelder</TableHead>
            <TableHead>Forelder tlf</TableHead>
            <TableHead>Elev</TableHead>
            <TableHead>Elev tlf</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.user_id}>
              <TableCell>
                {student.firstname_parent} {student.lastname_parent}
              </TableCell>
              <TableCell>{student.phone_parent}</TableCell>
              <TableCell>
                {student.firstname_student} {student.lastname_student}
              </TableCell>
              <TableCell>{student.phone_student}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </>)
}