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
import { Student } from "../types"

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL

const handleFreeze = async (student: Student, onFrozen: (studentUserId: string) => void) => {
    const token = localStorage.getItem('token')

    try {
        const response = await fetch(`${BASEURL}/freeze-student`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                "student_user_id": student.user_id
            })
        })

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`)
        }

        toast.success(`${student.firstname_parent} ${student.lastname_parent} er satt til frossen`)
        onFrozen(student.user_id)
    } catch (error) {
        toast.error(`Failed to freeze student: ${error}`)
    }
}

export const FreezeStudent = ({ student, onFrozen }: { student: Student, onFrozen: (studentUserId: string) => void }) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline" className="w-full">Frys {student.firstname_parent}</Button></AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Er du sikker på du vil fryse denne eleven</AlertDialogTitle>
                    <AlertDialogDescription>
                        Eleven blir midlertidig satt på pause og fjernet fra de aktive listene. Dette er ikke det samme som å sette eleven som inaktiv, og kan angres når som helst ved å tine eleven igjen.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Kanseler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleFreeze(student, onFrozen)}>Fortsett</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
