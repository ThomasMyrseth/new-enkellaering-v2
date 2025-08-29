"use client"
import React, { useState, useEffect } from "react"
import { Student, Teacher } from "./types"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronsUpDown, Check } from "lucide-react"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"


export const StudentsWithoutAnyTeachers = ({token, BASEURL} : {token :string, BASEURL :string}) => { 
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function getData() {
      const studentsResponse = await fetch(`${BASEURL}/get-student-without-teacher`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!studentsResponse.ok) {
        alert("Error fetching new students " + studentsResponse.statusText)
        return null
      }

      const studentsData = await studentsResponse.json()
      const s = studentsData.students

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

      // Fetch teachers
      const teachersResponse = await fetch(`${BASEURL}/get-all-teachers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (teachersResponse.ok) {
        const teachersData = await teachersResponse.json()
        const t = teachersData.teachers
        
        // Sort teachers alphabetically
        t.sort((a: Teacher, b: Teacher) => {
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
        
        setTeachers(t)
      }

      setLoading(false)
    }

    getData()
  }, [token, BASEURL])

  if (loading) {
    return <p>Loading...</p>
  }

  const handleAddNewTeacher = async (teacherUserId: string, studentUserId: string) => {
    try {
      const response = await fetch(`${BASEURL}/assign-teacher-for-student`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teacher_user_id: teacherUserId,
          student_user_id: studentUserId
        })
      })

      if (!response.ok) {
        alert("Error while assigning teacher to student")
      } else {
        toast("Læreren er blitt tildelt til eleven")
        // Refresh the data
        window.location.reload()
      }
    } catch (error) {
      alert(`Error assigning teacher: ${error}`)
    }
  }

  return (
    <div className="flex flex-col justify-center items-center w-full shadow-lg m-4 p-4 bg-white dark:bg-black rounded-lg">
      <h1 className="text-xl mb-4">Elever uten lærer, inaktive elever vises ikke her</h1>
      
      {students.map((s: Student, index) => {
        if (s.is_active === false) {
          return null
        }

        return (
          <div key={index} className="bg-white dark:bg-black w-full p-4 rounded-lg mb-4">
            <Accordion type="single" collapsible className="w-full mt-4">
              <AccordionItem value="student-details">
                <AccordionTrigger className="w-full h-full p-4">
                  <div className="flex flex-row justify-between items-center w-full pr-2">
                    <p className="text-start">
                      {s.firstname_parent} {s.lastname_parent} <br/>
                      & {s.firstname_student} {s.lastname_student} <br/>
                      {s.phone_parent}
                    </p>
                    <div className="flex flex-col">
                      <p className="text-end text-neutral-400">
                        {parseInt(s.postal_code) < 4000 ? "Oslo" : "Trondheim"}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
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

                  <StudentNotes student={s} BASEURL={BASEURL} token={token} />

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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )
      })}
    </div>
  )
}

const SetTeacherCombobox = ({
  student,
  teachers,
  passSelectedTeacher
}: { 
  student: Student, 
  teachers: Teacher[], 
  passSelectedTeacher: ((teacherUserId: string, studentUserId: string) => void)
}) => {

  const [teacherUserId, setTeacherUserId] = useState<string | null>(student.your_teacher || null)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [open, setOpen] = useState<boolean>(false)
  const [showCombobox, setShowCombobox] = useState<boolean>(false)

  const getTeacherName = (teacher: Teacher | null) =>
    teacher ? `${teacher.firstname} ${teacher.lastname}` : "Ingen lærer tildelt"

  const handleSelectTeacher = (userId: string | null) => {
    if (!userId) {
      alert('Velg en lærer')
      return
    }
    setTeacherUserId(userId)
    const selected = userId ? (teachers.find((teacher) => teacher.user_id === userId) || null) : null
    setSelectedTeacher(selected)
    passSelectedTeacher(userId, student.user_id)
  }

  return (
    <>
      {!showCombobox ?
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
                  <CommandItem
                    key="no-teacher"
                    value="no-teacher"
                    onSelect={() => {
                      handleSelectTeacher(null)
                      setOpen(false)
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
                        handleSelectTeacher(teacher.user_id)
                        setOpen(false)
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
    </>
  )
}

const StudentNotes = ({student, BASEURL, token} : {student : Student, BASEURL: string, token: string}) => {
  const [notes, setNotes] = useState<string>(student.notes)

  const handleAddNotes = (note: string) => {
    setNotes(note)
  }

  const saveNotes = async (notes: string, studentUserId: string) => {
    try {
      const response = await fetch(`${BASEURL}/upload-notes-about-student`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_user_id: studentUserId,
          notes: notes
        }),
      })

      if (!response.ok) {
        throw new Error("An error occurred. Please try again.")
      } 

      toast("Notater lagret")        
      return true
    } catch (error) {
      console.error("Error uploading notes:", error)
      alert("An error occurred. Please try again.")
    }
  }

  return (
    <div className="flex flex-col my-10">
      <Textarea  
        rows={10} 
        className="w-full mb-2 dark:bg-neutral-800" 
        value={notes} 
        onChange={(e) => handleAddNotes(e.target.value)} 
        id="notes" 
        placeholder="Noter ned generell info om eleven (kun synlig for admin)"
      />
      <Button onClick={() => {saveNotes(notes, student.user_id)}} className="bg-blue-900 dark:bg-blue-900 dark:text-neutral-100">Lagre</Button>
    </div>
  )
}