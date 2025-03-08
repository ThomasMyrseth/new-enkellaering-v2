"use client"

import React from "react"
import { useState, useEffect } from "react"
import { NewStudent, Teacher } from "./types"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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

export const NewStudentWithPrefferedTeacher = () => {

}




function NewStudentWithPrefferedTeacherRow({ ns, teachers }: { ns: NewStudent, teachers :Teacher[] }) {
    const token = localStorage.getItem('token')
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'

    const [hasCalled, setHasCalled] = useState<boolean>(ns.has_called)
    const [calledAt, setCalledAt] = useState<Date>(new Date(ns.called_at))
    const [hasAnswered, setHasAnswered] = useState<boolean>(ns.has_answered)
    const [answeredAt, setAnsweredAt] = useState<Date>(new Date(ns.answered_at))
    const hasSignedUp =ns.has_signed_up
    const signedUpAt = new Date(ns.signed_up_at)
    
    const fromReferal = ns.from_referal
    const refereePhone = ns.referee_phone
   
    const [hasAssignedTeacher, setHasAssignedTeacher] = useState<boolean>(ns.has_assigned_teacher)
    const [assignedTeacherAt, setAssignedTeacherAt] = useState<Date>(new Date(ns.assigned_teacher_at))
    const [assingedTeacherUserId, setAssignedTeacherUserId] = useState<string | null> (ns.assigned_teacher_user_id || null)
    
    const [paidReferee, setPaidReferee] = useState<boolean>(ns.paid_referee)
    const [paidRefereeAt, setPaidRefereeAt] = useState<Date>(new Date(ns.paid_referee_at))
    
    const [hasFinishedOnboarding, setHasFinishedOnboarding] = useState<boolean>(ns.has_finished_onboarding)
    const [finishedOnboardingAt, setFinishedOnboardingAt] = useState<Date>(new Date(ns.finished_onboarding_at))
    const [comments, setComments] = useState<string>(ns.comments)







    const handleSetCalled = (value :string) => {
        const isCalled = value === "Ja"; // Convert value to boolean
        setHasCalled(isCalled)
        setCalledAt(new Date())
    }

    const handleSetAnswered = (value :string) => {
        const isAnswered = value === "Ja"; // Convert value to boolean
        setHasAnswered(isAnswered)
        setAnsweredAt(new Date())
    }

    const handleAssignTeacher = (teacherUserId :string) => {
        setHasAssignedTeacher(true)
        setAssignedTeacherAt(new Date())
        setAssignedTeacherUserId(teacherUserId)
    }

    const handleSetFinishedOnboarding = (value :string) => {
        const isFinishedOnboarding = value === "Ja"; // Convert value to boolean
        setHasFinishedOnboarding(isFinishedOnboarding)
        setFinishedOnboardingAt(new Date())
    }

    const handleSetPaidReferee = (value :string) => {
        const isPaidReferee = value === "Ja"; // Convert value to boolean
        setPaidReferee(isPaidReferee)
        setPaidRefereeAt(new Date())
    }

    const handleSaveClick = async () => {

        const response = await fetch(`${BASEURL}/update-new-student`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' // Added Content-Type header
            },
            body: JSON.stringify({
                "new_student_id": ns.new_student_id,
                "phone" : ns.phone,
                "has_called": hasCalled,
                "called_at": calledAt || null,
                "has_answered": hasAnswered,
                "answered_at": answeredAt || null,
                "has_signed_up": hasSignedUp,
                "signed_up_at": signedUpAt || null,
                "from_referal": fromReferal,
                "referee_phone": refereePhone || null,
                "has_assigned_teacher": hasAssignedTeacher,
                "teacher_user_id":  assingedTeacherUserId || null,
                "assigned_teacher_at": assignedTeacherAt || null,
                "has_finished_onboarding": hasFinishedOnboarding,
                "finished_onboarding_at": finishedOnboardingAt || null,
                "comments": comments || null,
                "paid_referee": paidReferee,
                "paid_referee_at": paidRefereeAt || null,
            })
        })

        if (!response.ok) {
            alert("Error while saving updates to new student")
            return null;
        }
        else {
            alert("Oppdateringer lagret")
        }
        
    }

    const handleDelete = async () => {

        const response = await fetch(`${BASEURL}/hide-new-student`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' // Added Content-Type header
            },
            body: JSON.stringify({
                new_student_id : ns.new_student_id
            })
        })

        if (!response.ok) {
            alert("Error while deleting new student")
            return null;
        }
        else {
            alert("Eleven er slettet")
        }

    }

    return(
    <TableRow className={`${ns.has_finished_onboarding ? "text-gray-400" : ""}`}>
        <TableCell className="font-medium min-w-80">{ns.phone.slice(0, 3)} {ns.phone.slice(3, 5)} {ns.phone.slice(5, 10)} {ns.phone.slice(10, 13)} 
                <br/>
                {new Intl.DateTimeFormat("nb-NO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Europe/Oslo"
                }).format(new Date(ns.created_at))}
                <br />
                <span>
                    {Math.floor((Date.now() - new Date(ns.created_at).getTime()) / (1000 * 60 * 60 * 24))} dager siden
                </span>
        </TableCell>

        <TableCell className="min-w-40">
            <RadioGroup onValueChange={handleSetCalled} defaultValue={ns.has_called? "Ja" : "Nei"} value={hasCalled? "Ja" : "Nei"}>
                <RadioGroupItem value="Ja" className="text-green-400"></RadioGroupItem>
                <RadioGroupItem value="Nei" className="text-red-400 "></RadioGroupItem>
            </RadioGroup>
        </TableCell>


        <TableCell className="min-w-40">
            <RadioGroup defaultValue={ns.has_answered? "Ja" : "Nei"} value={hasAnswered? "Ja" : "Nei"} onValueChange={handleSetAnswered}>
                <RadioGroupItem value="Ja" className="text-green-400"></RadioGroupItem>
                <RadioGroupItem value="Nei" className="text-red-400"></RadioGroupItem>
            </RadioGroup>
        </TableCell>

        <TableCell className="min-w-40">
            {hasSignedUp ? (
                <span className="text-green-400">Ja</span>
            ) : (
                <span className="text-red-400">Nei</span>
            )}
        </TableCell>



        <TableCell className="min-w-80">
            Sett lører
        </TableCell>


        <TableCell className="min-w-60">
            {fromReferal ? (
                <span className="text-gray-400">Fra {ns.referee_name} <br/> tlf: {refereePhone}</span>
            ) : (
                <span className="text-gray-400">Nei</span>

            )}
        </TableCell>

        <TableCell className="min-w-40">
            <RadioGroup defaultValue={ns.paid_referee? "Ja" : "Nei"} value={paidReferee? "Ja" : "Nei"} onValueChange={handleSetPaidReferee}>
                <RadioGroupItem value="Ja" className="text-green-400"></RadioGroupItem>
                <RadioGroupItem value="Nei" className="text-red-400"></RadioGroupItem>
            </RadioGroup>
        </TableCell>


        <TableCell className="min-w-40">
        <RadioGroup defaultValue={ns.has_finished_onboarding? "Ja" : "Nei"} value={hasFinishedOnboarding? "Ja" : "Nei"} onValueChange={handleSetFinishedOnboarding}>
                <RadioGroupItem value="Ja" className="text-green-400"></RadioGroupItem>
                <RadioGroupItem value="Nei" className="text-red-400"></RadioGroupItem>
            </RadioGroup>
        </TableCell>

        <TableCell className="min-w-[500px]">
            <Textarea placeholder="Noter ned viktig info om eleven" value={comments} onChange={(e) => setComments(e.target.value)} rows={6}/>
        </TableCell>

        <TableCell>
            <Button onClick={handleSaveClick}>Lagre endringer i raden</Button>
        </TableCell>


        <TableCell>
            <AlertDialog>
            <AlertDialogTrigger><Button className="bg-red-400 dark:bg-red-800 text-white dark:text-white">Slett ny elev</Button></AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Er du sikker på at du vil slette den nye eleven?</AlertDialogTitle>
                <AlertDialogDescription>
                    Dette kan ikke angres. Den nye eleven og all tilhørende data slettes permanent fra databasen.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Kanseler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialog>
        </TableCell>
    </TableRow>
    )
}
