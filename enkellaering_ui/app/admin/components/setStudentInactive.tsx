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

const handleSetInactive = async (student: Student, onSetInactive: (studentUserId: string) => void) => {
    const token = localStorage.getItem('token')

    try {
        const response = await fetch(`${BASEURL}/set-student-to-inactive`, {
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

        toast.success(`${student.firstname_parent} ${student.lastname_parent} er satt til inaktiv`)
        onSetInactive(student.user_id)
    } catch (error) {
        toast.error(`Failed to set student inactive: ${error}`)
    }
}

export const SetStudentInactive = ({ student, onSetInactive }: { student: Student, onSetInactive: (studentUserId: string) => void }) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="destructive">Sett {student.firstname_parent} som inaktiv</Button></AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Er du sikker på du vil sette denne eleven som inaktiv</AlertDialogTitle>
                    <AlertDialogDescription>
                        Dette kan ikke angres. Det blir ikke mulig å føre inn flere timer på eleven. Det blir ikke mulig å fakturere for ubetalte timer.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Kanseler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleSetInactive(student, onSetInactive)}>Fortsett</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
