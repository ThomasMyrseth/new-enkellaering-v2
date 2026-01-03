"use client"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

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
  
import { useEffect, useState } from "react"
import { NewStudent } from "./types";
import { toast } from "sonner";

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;



export function NewStudentsWorkflow() {
    const token = localStorage.getItem('token')
    const [loading, setLoading] = useState<boolean>(true)
    const [newStudents, setNewStudents] = useState<NewStudent[]>()

    //get all new students
    useEffect( () => {
        async function getNewStudents() {
            const response = await fetch(`${BASEURL}/get-new-students`, {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (!response.ok) {
                alert("Error fetching new students " + response.statusText)
                return null
            }

            const data = await response.json()
            const newStudents :NewStudent[] = data.new_students

            if (newStudents.length===0) {
                setLoading(false)
                setNewStudents([])
                return null
            }

            else {
                setNewStudents(newStudents)
                setLoading(false)
            }
        }

        getNewStudents()
    },[token])

    if (loading ) {
        return <p>Loading...</p>
    }

    if (!newStudents) {
        return <p>No new students found</p>
    }


    return (<div className="overflow-x-auto w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl">
            <NewStudentTable newStudents={newStudents}/>
    </div>
    )
    

}


import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"


const NewStudentTable =( {newStudents} : {newStudents : NewStudent[]})  => {
    const [hideCompleted, setHideCompleted] = useState<boolean>(true)
    const [onlyShowUnpaidReferals, setOnlyShowUnpaidReferrals] = useState<boolean>(false)

    //order newStudents by created_at
    newStudents.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB.getTime() - dateA.getTime();
    });

    //remove new students who have a preffered teacher
    let filteredStudents = newStudents.filter(ns => !ns.preffered_teacher && !ns.hidden)

    // Filter out completed students if switch is enabled
    if (hideCompleted) {
        filteredStudents = filteredStudents.filter(ns => !ns.has_finished_onboarding)
    }

    if (onlyShowUnpaidReferals) {
        filteredStudents = filteredStudents.filter(ns => ns.from_referal && !ns.paid_referee)
    }

    if (hideCompleted && onlyShowUnpaidReferals) {
        filteredStudents = filteredStudents.filter(ns => !ns.has_finished_onboarding && ns.from_referal && !ns.paid_referee)
    }

    return (<div className="w-full max-w-full bg-white dark:bg-black rounded-sm shadow-lg flex flex-col items-center justify-center overflow-hidden">
        <div className="flex flex-col space-y-2 items-center">
            <div className="flex items-center space-x-2 m-4">
                <Switch
                    id="hide-completed"
                    checked={hideCompleted}
                    onCheckedChange={(checked) => {
                        setHideCompleted(checked)
                    }}
                />
                <Label htmlFor="hide-completed">Skjul elever som har fullført oppstart</Label>
            </div>
            <div className="flex items-center space-x-2 m-4">
                <Switch
                    id="only-show-unpaid-referals"
                    checked={onlyShowUnpaidReferals}
                    onCheckedChange={(checked) => {
                        setOnlyShowUnpaidReferrals(checked)
                    }}
                />
                <Label htmlFor="only-show-unpaid-referals">Vis kun elever som er referanser og som ikke er betalt</Label>
            </div>
        </div>

        <div className="overflow-x-auto w-full max-w-full">
        <Table>
                <TableCaption>Arbeidsoversikt for ny elev ({filteredStudents.length})</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Telefonnummer & dato opprettet</TableHead>
                            <TableHead>Jeg har ringt</TableHead>
                            <TableHead>Ny elev har svart</TableHead>
                            <TableHead>Ny elev er en referanse</TableHead>
                            <TableHead>Referansen er betalt</TableHead>
                            <TableHead>Ny elev har fullført oppstart</TableHead>
                            <TableHead>Kommentarer</TableHead>
                            <TableHead>Lagre</TableHead>
                            <TableHead>Slett ny elev</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="">
                        {filteredStudents.map( ns => {
                            return <NewStudentRow key={ns.new_student_id} ns={ns}/>
                        })}
                    </TableBody>
        </Table>
        </div>
    </div>)
}


function NewStudentRow({ ns }: { ns: NewStudent }) {
    const token = localStorage.getItem('token')

    const [hasCalled, setHasCalled] = useState<boolean>(ns.has_called)
    const [calledAt, setCalledAt] = useState<Date>(new Date(ns.called_at))
    const [hasAnswered, setHasAnswered] = useState<boolean>(ns.has_answered)
    const [answeredAt, setAnsweredAt] = useState<Date>(new Date(ns.answered_at))
    
    const fromReferal = ns.from_referal
    const refereePhone = ns.referee_phone
    
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
                "from_referal": fromReferal,
                "referee_phone": refereePhone || null,
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
            toast("Oppdateringer lagret")
        }
        
    }

    const handleDelete = async () => {

        const response = await fetch(`${BASEURL}/hide-new-student-from-new-students-table`, {
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
            toast("Eleven er slettet")
        }

    }

    return(
    <TableRow className={`w-4/5 max-w-full ${ns.has_finished_onboarding ? "text-gray-400" : ""}`}>
        <TableCell className="font-medium ">{ns.phone.slice(0, 3)} {ns.phone.slice(3, 5)} {ns.phone.slice(5, 10)} {ns.phone.slice(10, 13)} 
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

        <TableCell className="">
            <RadioGroup onValueChange={handleSetCalled} defaultValue={ns.has_called? "Ja" : "Nei"} value={hasCalled? "Ja" : "Nei"}>
                <RadioGroupItem value="Ja" className="text-green-400"></RadioGroupItem>
                <RadioGroupItem value="Nei" className="text-red-400 "></RadioGroupItem>
            </RadioGroup>
        </TableCell>


        <TableCell className="">
            <RadioGroup defaultValue={ns.has_answered? "Ja" : "Nei"} value={hasAnswered? "Ja" : "Nei"} onValueChange={handleSetAnswered}>
                <RadioGroupItem value="Ja" className="text-green-400"></RadioGroupItem>
                <RadioGroupItem value="Nei" className="text-red-400"></RadioGroupItem>
            </RadioGroup>
        </TableCell>


        <TableCell className="">
            {fromReferal ? (
                <span className="text-gray-400">Fra {ns.referee_name} <br/> tlf: {refereePhone}
                <br/> kontoNr: {ns.referee_account_number}
                </span>
            ) : (
                <span className="text-gray-400">Nei</span>

            )}
        </TableCell>

        <TableCell className="">
            <RadioGroup defaultValue={ns.paid_referee? "Ja" : "Nei"} value={paidReferee? "Ja" : "Nei"} onValueChange={handleSetPaidReferee}>
                <RadioGroupItem value="Ja" className="text-green-400"></RadioGroupItem>
                <RadioGroupItem value="Nei" className="text-red-400"></RadioGroupItem>
            </RadioGroup>
        </TableCell>


        <TableCell className="">
        <RadioGroup defaultValue={ns.has_finished_onboarding? "Ja" : "Nei"} value={hasFinishedOnboarding? "Ja" : "Nei"} onValueChange={handleSetFinishedOnboarding}>
                <RadioGroupItem value="Ja" className="text-green-400"></RadioGroupItem>
                <RadioGroupItem value="Nei" className="text-red-400"></RadioGroupItem>
            </RadioGroup>
        </TableCell>

        <TableCell className="min-w-96">
            <Textarea placeholder="Noter ned viktig info om eleven" value={comments} onChange={(e) => setComments(e.target.value)} rows={6}/>
        </TableCell>

        <TableCell>
            <Button variant="secondary" className="w-full" onClick={handleSaveClick}>Lagre</Button>
        </TableCell>


        <TableCell>
            <AlertDialog>
            <AlertDialogTrigger><Button variant="destructive">Slett ny elev</Button></AlertDialogTrigger>
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