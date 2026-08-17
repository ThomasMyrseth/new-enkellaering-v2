"use client"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { Copy } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Classes, Student } from "../types"
import { TeacherStudent } from "@/types/teacher-student"

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL

export const InvoiceStudentPopover = ({ student, classes, teacherStudents }: { student: Student, classes: Classes[], teacherStudents: TeacherStudent[] }) => {
    const token = localStorage.getItem('token')

    const [success, setSuccess] = useState<boolean | null>(null)
    let numberOfClassesToInvoice = 0
    const [clickedCopy, setClickedCopy] = useState<boolean>(false)

    const monthsInNorwegian = [
        "januar", "februar", "mars", "april", "mai", "juni",
        "juli", "august", "september", "oktober", "november", "desember"
    ]
    const currentDate = new Date()
    const currentMonth: string = monthsInNorwegian[currentDate.getMonth()]
    const currentYear: number = currentDate.getFullYear()

    let totalInvoiceAmmount = 0
    let totalNumberOfHours = 0
    let totalTravelPay = 0
    const classIds: string[] = []

    classes.forEach((c: Classes) => {
        if (c.invoiced_student) {
            return
        }

        classIds.push(c.class_id)
        numberOfClassesToInvoice += 1

        const startTime: string = c.started_at
        const endTime: string = c.ended_at
        const durationHours = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60)

        totalNumberOfHours += durationHours

        let thisClass = durationHours * 540
        if (c.groupclass) {
            thisClass = durationHours * 350
        }

        if (student.discount) {
            thisClass = thisClass * (1 - student.discount)
        }

        totalInvoiceAmmount += thisClass

        const ts = teacherStudents.find((ts: TeacherStudent) =>
            ts.student?.user_id === c.student_user_id &&
            ts.teacher?.user_id === c.teacher_user_id
        )
        const travelPayFromStudent = Number(ts?.relation.travel_pay_from_student || 0)
        totalTravelPay += travelPayFromStudent
    })

    totalInvoiceAmmount = Math.round(totalInvoiceAmmount * 10) / 10
    totalNumberOfHours = Math.round(totalNumberOfHours * 10) / 10
    totalTravelPay = Math.round(totalTravelPay * 10) / 10

    const handleSetClassesToInvoiced = async () => {
        const res = await fetch(`${BASEURL}/set-classes-to-invoiced`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                "class_ids": classIds
            })
        })

        if (res.status == 401) {
            toast.error("Alle timer er allerede satt som fakturert!")
        } else if (!res.ok) {
            setSuccess(false)
            toast.error("En feil har skjedd. Kunne ikke sette timene til fakturert!")
        } else {
            setSuccess(true)
        }
    }

    const contentRef = useRef<HTMLDivElement>(null)

    const copyToClipboard = () => {
        if (contentRef.current) {
            const content = contentRef.current.innerText
            navigator.clipboard.writeText(content).then(() => {
                setClickedCopy(true)
            }).catch(err => {
                setClickedCopy(false)
                toast.error("error copying text")
                console.error("Failed to copy text: ", err)
            })
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="secondary">Send faktura til {student.firstname_parent} {student.lastname_parent}</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                {success === true && <p className="text-green-400">Timene er satt til fakturert</p>}
                {success === false && <p className="text-red-400">En feil har skjedd, prøv igjen</p>}

                <div ref={contentRef}>
                    <p>
                        Faktura for privatundervisning i {currentMonth} {currentYear}
                        <br/>
                        {student.discount ? `Rabatt: ${Math.round(student.discount * 100)}%` : ''}
                        <br/>
                        Total {totalNumberOfHours} timer, {totalInvoiceAmmount + totalTravelPay} kroner, fordelt på {numberOfClassesToInvoice} ganger
                        <br/>
                        Derav {totalTravelPay} kroner i reisetillegg
                    </p>

                    <div className="">
                        {classes.map((c: Classes, index) => {
                            if (c.invoiced_student) {
                                return null
                            }

                            const startTime: string = c.started_at
                            const endTime: string = c.ended_at
                            const formatDateTime = (dateString: string): string => {
                                const date = new Date(dateString)
                                return new Intl.DateTimeFormat("nb-NO", {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }).format(date)
                            }

                            const formattedStartTime = formatDateTime(startTime)
                            const formattedEndTime = formatDateTime(endTime)

                            return (
                                <div key={index}>
                                    <p>
                                        Fra {formattedStartTime} til {formattedEndTime}{c.was_canselled ? '*' : ''} ({c.groupclass ? 'Gruppetime' : 'Individuell time'})<br/>
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                    <br/><p>* vil si at timen ble kansellert mindre enn 24 timer før avtalt oppstart</p>
                </div>

                <div className="flex flex-row space-x-4 justify-start mt-5">
                    <Button variant="ghost" onClick={copyToClipboard} disabled={clickedCopy}>
                        <Copy/>
                    </Button>
                    <Button variant="secondary" onClick={handleSetClassesToInvoiced} disabled={success === true || numberOfClassesToInvoice === 0}>Sett timene til fakturert</Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
