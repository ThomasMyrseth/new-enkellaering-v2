"use client"

import { useEffect, useState } from "react"
import { Task } from "./types"
import { useTasks } from "@/hooks/use-tasks"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export function TasksWorkflow() {
    const [tasksData, loading, error] = useTasks()
    const [tasks, setTasks] = useState<Task[]>([])

    useEffect(() => {
        //order alphabetically by firstanme student
        const sorted = [...tasksData].sort((a, b) => {
            if (a.student_data && b.student_data) {
                return a.student_data.firstname_student.localeCompare(b.student_data.firstname_student)
            }
            return 0
        })

        setTasks(sorted)
    }, [tasksData])

    if (error) toast.error("Kunne ikke hente oppgaver")

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
            <h3 className="text-2xl font-bold mb-6">Elevoppgaver ({tasks.length})</h3>
            {tasks.length === 0 ? (
                <p className="text-gray-500">Ingen oppgaver funnet</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onUpdate={() => setTasks((prev) => prev.filter((t) => t.id !== task.id))}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

function TaskCard({ task, onUpdate }: { task: Task, onUpdate: () => void }) {
    const [status, setStatus] = useState<string>(task.status)

    const handleStatusChange = async (newStatus: string) => {
        try {
            await apiFetch(`/task/${task.id}/status`, {
                method: "PUT",
                body: { status: newStatus }
            })

            setStatus(newStatus)
            toast.success("Status oppdatert")
        } catch (error) {
            console.error("Error updating status:", error)
            toast.error("Kunne ikke oppdatere status")
        }
    }

    const handleComplete = async () => {
        try {
            await apiFetch(`/task/${task.id}/complete`, {
                method: "POST"
            })

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
                    <div className="text-sm">
                        <span className="font-semibold">Elev:</span>{" "}
                        {task.student_data?.firstname_student} {task.student_data?.lastname_student}
                        <br />
                        <span className="text-gray-500">{task.student_data?.phone_student}</span>
                    </div>
                    <div className="text-sm">
                        <span className="font-semibold">Forelder:</span>{" "}
                        {task.student_data?.firstname_parent} {task.student_data?.lastname_parent}
                        <br />
                        <span className="text-gray-500">{task.student_data?.phone_parent}</span>
                    </div>
                    <div className="text-sm">
                        <span className="font-semibold">Lærere:</span>{" "}
                        {task.teachers_data && task.teachers_data.length > 0 ? (
                            <div className="ml-2 flex flex-col">
                                {task.teachers_data.map((teacher) => (
                                    <div key={teacher.user_id}>
                                        {teacher.firstname} {teacher.lastname} | {teacher.phone}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="text-gray-500">Ingen lærere</span>
                        )}
                    </div>
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
