"use client"

import { useEffect, useState } from "react"
import { Task } from "./types"
import { useTeacherTasks } from "@/hooks/use-tasks"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

async function updateTaskStatus(taskId: string | number, status: string) {
    return apiFetch<void>(`/task/${taskId}/status`, {
        method: "PUT",
        body: { status }
    })
}

async function updateTaskNotes(taskId: string | number, notes: string) {
    return apiFetch<void>(`/task/${taskId}/notes`, {
        method: "PUT",
        body: { notes }
    })
}

async function completeTask(taskId: string | number) {
    return apiFetch<void>(`/task/${taskId}/complete`, {
        method: "POST"
    })
}

export function TeacherTasksWorkflow() {
    const [teacherTasks, loading, error] = useTeacherTasks()
    const [tasks, setTasks] = useState<Task[]>([])

    useEffect(() => {
        const tasksData = [...teacherTasks]

        tasksData.sort((a, b) => {
            if (a.teacher_data && b.teacher_data) {
                return a.teacher_data.firstname.localeCompare(b.teacher_data.firstname)
            }
            return 0
        })

        setTasks(tasksData)
    }, [teacherTasks])

    if (error) toast.error(error)

    const handleTaskCompleted = (taskId: string | number) => {
        setTasks((prev) => prev.filter((t) => t.id !== taskId))
    }

    if (loading) {
        return (
            <div className="w-full flex flex-col items-center justify-center shadow-lg dark:bg-black bg-white rounded-lg p-4">
                <Skeleton className="h-6 w-48 mt-4 mb-4" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col items-center justify-center shadow-lg dark:bg-black bg-white rounded-lg p-4">
            <h3 className="text-2xl font-bold mb-6">Læreroppgaver ({tasks.length})</h3>
            {tasks.length === 0 ? (
                <p className="text-gray-500">Ingen læreroppgaver funnet</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {tasks.map((task) => (
                        <TeacherTaskCard key={task.id} task={task} onUpdate={() => handleTaskCompleted(task.id)} />
                    ))}
                </div>
            )}
        </div>
    )
}

function TeacherTaskCard({ task, onUpdate }: { task: Task, onUpdate: () => void }) {
    const [status, setStatus] = useState<string>(task.status)
    const [notes, setNotes] = useState<string>(task.notes ?? "")

    const handleNotesBlur = async () => {
        try {
            await updateTaskNotes(task.id, notes)

            toast.success("Notat lagret")
        } catch (error) {
            console.error("Error updating notes:", error)
            toast.error("Kunne ikke lagre notat")
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        try {
            await updateTaskStatus(task.id, newStatus)

            setStatus(newStatus)
            toast.success("Status oppdatert")
        } catch (error) {
            console.error("Error updating status:", error)
            toast.error("Kunne ikke oppdatere status")
        }
    }

    const handleComplete = async () => {
        try {
            await completeTask(task.id)

            toast.success("Oppgave fullført")
            onUpdate()
        } catch (error) {
            console.error("Error completing task:", error)
            toast.error("Kunne ikke fullføre oppgave")
        }
    }

    const getStatusDotColor = () => {
        switch (status) {
            case "ringt og fått svar":
                return "bg-green-500"
            case "ringt men ikke fått svar":
                return "bg-yellow-500"
            case "ikke startet":
            default:
                return "bg-red-500"
        }
    }

    return (
        <Card className="flex flex-col h-full w-full">
            <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                    <span className={`w-3 h-3 rounded-full ${getStatusDotColor()}`}></span>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                </div>
                <CardDescription className="text-sm">{task.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="space-y-2">
                    {task.teacher_data && (
                        <div className="text-sm">
                            <span className="font-semibold">Lærer:</span>{" "}
                            {task.teacher_data.firstname} {task.teacher_data.lastname}
                            <br />
                            <span className="text-gray-500">{task.teacher_data.phone}</span>
                            <br />
                            <span className="text-gray-500">{task.teacher_data.email}</span>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`status-${task.id}`} className="text-sm font-semibold">Status:</Label>
                    <select
                        id={`status-${task.id}`}
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="ikke startet">🔴 Ikke startet</option>
                        <option value="ringt men ikke svar">🟡 Ringt men ikke svar</option>
                        <option value="ringt og fått svar">🟢 Ringt og fått svar</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor={`notes-${task.id}`} className="text-sm font-semibold">Notater:</Label>
                    <Textarea
                        id={`notes-${task.id}`}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        onBlur={handleNotesBlur}
                        placeholder="Legg til notater..."
                        className="w-full"
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleComplete}
                    className="w-full"
                    variant="secondary"
                >
                    Fullfør og skjul oppgaven
                </Button>
            </CardFooter>
        </Card>
    )
}
