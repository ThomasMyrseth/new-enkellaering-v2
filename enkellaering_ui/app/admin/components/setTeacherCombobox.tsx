"use client"
import { useState } from "react"
import { ChevronsUpDown, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Student, Teacher } from "../types"

export const SetTeacherCombobox = ({
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
            toast.error('Velg en lærer')
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
                <Button variant="secondary" onClick={() => { setShowCombobox(!showCombobox); setOpen(!open) }}>Legg til ny lærer</Button> :
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
