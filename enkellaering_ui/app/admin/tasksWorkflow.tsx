"use client"

import { useEffect, useState } from "react"
import { Task } from "./types"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080"

export function TasksWorkflow() {
    const token = localStorage.getItem('token')
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${BASEURL}/task/all`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error("Failed to fetch tasks")
            }

            const data = await response.json()
            const tasksData: Task[] = data.tasks

            setTasks(tasksData)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching tasks:", error)
            toast.error("Kunne ikke hente oppgaver")
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [token])

    if (loading) {
        return (
            <div className="w-full flex flex-col items-center justify-center shadow-lg dark:bg-black bg-white rounded-lg p-4">
                <p>Laster oppgaver...</p>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col items-center justify-center shadow-lg dark:bg-black bg-white rounded-lg p-4">
            <h3 className="text-2xl font-bold mb-6">Oppgaver ({tasks.length})</h3>
            {tasks.length === 0 ? (
                <p className="text-gray-500">Ingen oppgaver funnet</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onUpdate={fetchTasks} />
                    ))}
                </div>
            )}
        </div>
    )
}

function TaskCard({ task, onUpdate }: { task: Task, onUpdate: () => void }) {
    const token = localStorage.getItem('token')
    const [status, setStatus] = useState<string>(task.status)

    const handleStatusChange = async (newStatus: string) => {
        try {
            const response = await fetch(`${BASEURL}/task/${task.id}/status`, {
                method: "PATCH",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) {
                throw new Error("Failed to update status")
            }

            setStatus(newStatus)
            toast.success("Status oppdatert")
        } catch (error) {
            console.error("Error updating status:", error)
            toast.error("Kunne ikke oppdatere status")
        }
    }

    const handleComplete = async () => {
        try {
            const response = await fetch(`${BASEURL}/task/${task.id}/complete`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                throw new Error("Failed to complete task")
            }

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
            case "ringt men ikke svar":
                return "bg-yellow-500"
            case "ikke startet":
            default:
                return "bg-red-500"
        }
    }

    return (
        <Card className="flex flex-col h-full">
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
                    </div>
                    <div className="text-sm">
                        <span className="font-semibold">Forelder:</span>{" "}
                        {task.student_data?.firstname_parent} {task.student_data?.lastname_parent}
                        <br />
                        <span className="text-gray-500">{task.student_data?.phone_parent}</span>
                    </div>
                    <div className="text-sm">
                        <span className="font-semibold">Lærer:</span>{" "}
                        {task.teacher_data?.firstname} {task.teacher_data?.lastname}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold">Status:</Label>
                    <RadioGroup value={status} onValueChange={handleStatusChange}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ikke startet" id={`${task.id}-not-started`} />
                            <Label htmlFor={`${task.id}-not-started`} className="flex items-center gap-2 cursor-pointer">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                Ikke startet
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ringt men ikke svar" id={`${task.id}-no-answer`} />
                            <Label htmlFor={`${task.id}-no-answer`} className="flex items-center gap-2 cursor-pointer">
                                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                Ringt men ikke svar
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="ringt og fått svar" id={`${task.id}-answered`} />
                            <Label htmlFor={`${task.id}-answered`} className="flex items-center gap-2 cursor-pointer">
                                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                Ringt og fått svar
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleComplete}
                    className="w-full"
                    variant="default"
                >
                    Fullfør
                </Button>
            </CardFooter>
        </Card>
    )
}
