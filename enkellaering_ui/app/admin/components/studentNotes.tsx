"use client"
import { useState } from "react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { apiFetch } from "@/lib/api"
import { Student } from "../types"

const saveNotes = async (notes: string, studentUserId: string) => {
    try {
        await apiFetch("/upload-notes-about-student", {
            method: "POST",
            body: {
                student_user_id: studentUserId,
                notes: notes
            }
        })

        toast.success("Notater lagret")
        return true
    } catch (error) {
        console.error("Error uploading notes:", error)
        toast.error("An error occurred. Please try again.")
    }
}

export const StudentNotes = ({ student }: { student: Student }) => {
    const [notes, setNotes] = useState<string>(student.notes)

    const handleAddNotes = (note: string) => {
        setNotes(note)
    }

    return (
        <div className="flex flex-col my-10">
            <Textarea
                rows={10}
                className="w-full mb-2 dark:bg-neutral-800"
                value={notes}
                onChange={(e) => handleAddNotes(e.target.value)}
                onBlur={() => saveNotes(notes, student.user_id)}
                id="notes"
                placeholder="Noter ned generell info om eleven (kun synlig for admin)"
            />
        </div>
    )
}
