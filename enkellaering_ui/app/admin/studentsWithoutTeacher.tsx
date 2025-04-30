"use client"
import React from "react"
import { useState, useEffect } from "react"
import { Student, Teacher } from "./types"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"



  import { cn } from "@/lib/utils"
  import { Check, ChevronsUpDown } from "lucide-react"
  
  import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"


export function NewStudentsWithoutTeacherPage() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    const token = localStorage.getItem('token')

    const [students, setStudents] = useState<Student[]>([])
    const [teachers, setTeachers] = useState<Teacher[]>([])


    //fetching data
    useEffect( () => {
        async function fetchStudents() {
            const response = await fetch(`${baseUrl}/get-all-students`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                alert("Error fetching students " + response.statusText)
                return null
            }

            const data = await response.json()
            const students :Student[] = data.students

            //alfabetically order by firstname_parent
            students.sort( (a, b) =>{
                return a.firstname_parent.localeCompare(b.firstname_parent)
            })

            setStudents(students)

            if (students.length===0) {
                alert("No students found")
                return null
            }
        }
        fetchStudents()

        async function fetchTeachers() {
            const response = await fetch(`${baseUrl}/get-all-teachers`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                alert("Error fetching teachers " + response.statusText)
                return null
            }

            const data = await response.json()
            console.log("teacher data", data)
            const teachers :Teacher[] = data.teachers
            setTeachers(teachers)

            if (teachers.length===0) {
                alert("No teachers found")
                return null
            }
        }
        fetchTeachers()
    },[])

    return (<div className="flex flex-col items-center space-y-3">
        <h3>Elever som mangler lærer</h3>
        <div className="bg-white shadow-lg rounded-sm dark:bg-black w-full">
            <Table className="bg-white shadow-lg rounded-sm dark:bg-black">
            <TableHeader>
                <TableRow>
                    <TableHead>Forelder</TableHead>
                    <TableHead>Forelders tlf</TableHead>

                    <TableHead>Elev</TableHead>
                    <TableHead>Elev tlf</TableHead>

                    <TableHead>Tildelt lærer</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody key={'1'} className="h-auto">
                {students.map((s: Student) => {
                    if (s.your_teacher) {
                        return null; // Skip students who have a teacher
                    }

                    //skip inactive students
                    if (s.is_active===false) {
                        return null;
                    }
                    return (
                        <>
                            <TableRow className="m-0 p-0" key={s.user_id}>
                                <TableCell>{s.firstname_parent} {s.lastname_parent}</TableCell>
                                <TableCell>{s.phone_parent}</TableCell>
                                <TableCell>{s.firstname_student} {s.lastname_student}</TableCell>
                                <TableCell>{s.phone_student}</TableCell>
                                <TableCell>
                                    <SetTeacherCombobox student={s} teachers={teachers} passSelectedTeacher={assignTeacher} />
                                </TableCell>
                            </TableRow>
                        </>
                    );
                })}

            </TableBody>
            </Table>
        </div>


        <br/>

        <p>Elever som har lærer</p>
        <div className="bg-white shadow-lg rounded-sm dark:bg-black w-full">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Forelder</TableHead>
                    <TableHead>Forelders tlf</TableHead>

                    <TableHead>Elev</TableHead>
                    <TableHead>Elev tlf</TableHead>

                    <TableHead>Tildelt lærer</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody key={'2'}>
                {students.map( (s :Student) => {

                    //do not display students that lack a teacher
                if (!s.your_teacher) {
                    return null
                }

                if (!s.is_active) {
                    return null;
                }
                
                return (<>
                    <TableRow key={s.user_id}>
                        <TableCell>
                            {s.firstname_parent} {s.lastname_parent}
                        </TableCell>
                        <TableCell>
                            {s.phone_parent}
                        </TableCell>

                        <TableCell>
                            {s.firstname_student} {s.lastname_student}
                        </TableCell>
                        <TableCell>
                            {s.phone_student}
                        </TableCell>

                        <TableCell>
                            <SetTeacherCombobox student={s} teachers={teachers} passSelectedTeacher={assignTeacher}/>
                        </TableCell>

                    </TableRow>
                </>)
                })
                }
            </TableBody>
        </Table>   
        </div>

        <InactiveStudents students={students}/>
    </div>)

}



const InactiveStudents = ( {students} : {students : Student[]}) => {

    return(<>
    <h3 className="pt-4">Inaktive elever</h3>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Forelder</TableHead>
                    <TableHead>Forelders tlf</TableHead>

                    <TableHead>Elev</TableHead>
                    <TableHead>Elev tlf</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody key={'2'}>
                {students.map( (s :Student) => {

                    //do not display students that are active
                if (s.is_active===true) {
                    return null
                }
                else {
                    return (<>
                        <TableRow key={s.user_id}>
                            <TableCell>
                                {s.firstname_parent} {s.lastname_parent}
                            </TableCell>
                            <TableCell>
                                {s.phone_parent}
                            </TableCell>

                            <TableCell>
                                {s.firstname_student} {s.lastname_student}
                            </TableCell>
                            <TableCell>
                                {s.phone_student}
                            </TableCell>
                            <TableCell>
                                <Button className="w-full" onClick={() => handleSetActive(s)}>
                                    Sett {s.firstname_parent} til aktiv
                                </Button>
                            </TableCell>
                        </TableRow>
                    </>)
                }    
                })
                }
            </TableBody>
        </Table>   
    </>)
}


const assignTeacher = async (
    teacherUserId: string | null, 
    studentUserId: string, 
    oldTeacherUserId: string | null
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
        student_user_id: studentUserId,
        old_teacher_user_id: oldTeacherUserId
      })
    });
  
    if (!response.ok) {
      alert("Error while assigning teacher to student");
    } else {
      toast("Læreren er blitt tildelt til eleven");
    }
};

const handleSetActive = async (student: Student) => {
    const token = localStorage.getItem('token')
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;

    try {
        const response = await fetch(`${BASEURL}/set-student-to-active`, {
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

        toast(`${student.firstname_parent} ${student.lastname_parent} er satt til aktiv`)

    } catch (error) {
        alert(`Failed to set student inactive: ${error}`);
    }
}

const SetTeacherCombobox = ({
    student,
    teachers,
    passSelectedTeacher
  }: { 
    student: Student, 
    teachers: Teacher[], 
    passSelectedTeacher: (teacherUserId: string | null, studentUserId: string, oldTeacherUserId: string | null) => void 
  }) => {
    // Capture the original teacher from the student as the old teacher
    const oldTeacher = student.your_teacher || null;
  
    const [teacherUserId, setTeacherUserId] = useState<string | null>(student.your_teacher || null);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(
      teachers.find((teacher) => teacher.user_id === student.your_teacher) || null
    );
    const [open, setOpen] = useState<boolean>(false);
  
    useEffect(() => {
      setTeacherUserId(student.your_teacher || null);
      setSelectedTeacher(
        teachers.find((teacher) => teacher.user_id === student.your_teacher) || null
      );
    }, [student.your_teacher, teachers]);
  
    const getTeacherName = (teacher: Teacher | null) =>
      teacher ? `${teacher.firstname} ${teacher.lastname}` : "Ingen lærer tildelt";
  
    const handleSelectTeacher = (userId: string | null) => {
      setTeacherUserId(userId);
      const selected = userId ? (teachers.find((teacher) => teacher.user_id === userId) || null) : null;
      setSelectedTeacher(selected);
      // Pass the new teacher, student id, and old teacher id to the assign function
      passSelectedTeacher(userId, student.user_id, oldTeacher);
    };
  
    return (
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
                    value={teacher.user_id}
                    onSelect={(currentValue) => {
                      handleSelectTeacher(currentValue);
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
    );
};