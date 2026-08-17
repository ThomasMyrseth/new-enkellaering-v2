"use client"
import { toast } from "sonner"
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
import { Teacher } from "../types"

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL

const handleFreeze = async (teacher: Teacher, onFrozen?: (teacherUserId: string) => void) => {
    const token = localStorage.getItem('token')

    try {
        const response = await fetch(`${BASEURL}/freeze-teacher`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                "teacher_user_id": teacher.user_id
            })
        })

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`)
        }

        toast.success(`${teacher.firstname} ${teacher.lastname} har blitt frosset`)
        onFrozen?.(teacher.user_id)
    } catch (error) {
        toast.error(`Failed to freeze teacher: ${error}`)
    }
}

export const FreezeTeacher = ({ teacher, onFrozen }: { teacher: Teacher, onFrozen?: (teacherUserId: string) => void }) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline">Frys {teacher.firstname}</Button></AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Er du sikker på du vil fryse denne læreren?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Læreren blir midlertidig satt på pause og fjernet fra de aktive listene. Dette er ikke det samme som å pensjonere læreren, og kan angres når som helst ved å tine læreren igjen.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Kanseler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleFreeze(teacher, onFrozen)}>Fortsett</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
