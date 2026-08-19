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
import { apiFetch, ApiError } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewStudents } from "@/hooks/use-new-students";



export function NewStudentsWorkflow() {
    const [newStudents, loading, error, setNewStudents] = useNewStudents()

    if (error) toast.error(error)

    if (loading) {
        return (
            <div className="overflow-x-auto w-full">
                <Skeleton className="h-6 w-48 mt-4 mb-4" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    if (!newStudents) {
        return <p>No new students found</p>
    }


    const handleDeleteStudent = (newStudentId: string) => {
        setNewStudents(prev => prev.filter(s => s.new_student_id !== newStudentId))
    }

    const handleSetGroup = async (newStudentId: string, group: string | null) => {
        const ns = newStudents.find(s => s.new_student_id === newStudentId)
        if (!ns) return

        const newMeta = { ...(ns.meta ?? { source: "" }), group }
        setNewStudents(prev => prev.map(s => s.new_student_id === newStudentId ? { ...s, meta: newMeta } : s))

        try {
            await apiFetch("/update-new-student", {
                method: "POST",
                body: {
                    "new_student_id": ns.new_student_id,
                    "phone": ns.phone,
                    "has_called": ns.has_called,
                    "called_at": ns.called_at || null,
                    "has_answered": ns.has_answered,
                    "answered_at": ns.answered_at || null,
                    "from_referal": ns.from_referal,
                    "referee_phone": ns.referee_phone || null,
                    "has_finished_onboarding": ns.has_finished_onboarding,
                    "finished_onboarding_at": ns.finished_onboarding_at || null,
                    "comments": ns.comments || null,
                    "paid_referee": ns.paid_referee,
                    "paid_referee_at": ns.paid_referee_at || null,
                    "meta": newMeta,
                }
            })
            toast.success("Gruppe oppdatert")
        } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Error while updating group")
        }
    }

    return (<div className="overflow-x-auto w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl">
            <NewStudentTable newStudents={newStudents} onDelete={handleDeleteStudent} onSetGroup={handleSetGroup}/>
    </div>
    )


}


import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LayoutGrid, TableIcon, Folder, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react"

type ViewMode = "table" | "cards" | "groups"

const NEW_STUDENTS_VIEW_MODE_STORAGE_KEY = "newStudentsWorkflow.viewMode"
const NEW_STUDENTS_CUSTOM_GROUPS_STORAGE_KEY = "newStudentsWorkflow.customGroups"
const NEW_STUDENTS_GROUP_FILTER_STORAGE_KEY = "newStudentsWorkflow.groupFilter"

const NewStudentTable =( {newStudents, onDelete, onSetGroup} : {newStudents : NewStudent[], onDelete: (newStudentId: string) => void, onSetGroup: (newStudentId: string, group: string | null) => void})  => {
    const [hideCompleted, setHideCompleted] = useState<boolean>(true)
    const [onlyShowUnpaidReferals, setOnlyShowUnpaidReferrals] = useState<boolean>(false)
    const [viewMode, setViewModeState] = useState<ViewMode>("table")
    const [customGroups, setCustomGroupsState] = useState<string[]>([])
    const [groupFilter, setGroupFilterState] = useState<string>("all")

    useEffect(() => {
        const stored = localStorage.getItem(NEW_STUDENTS_VIEW_MODE_STORAGE_KEY)
        if (stored === "table" || stored === "cards" || stored === "groups") {
            setViewModeState(stored)
        }

        const storedCustomGroups = localStorage.getItem(NEW_STUDENTS_CUSTOM_GROUPS_STORAGE_KEY)
        if (storedCustomGroups) {
            try {
                const parsed = JSON.parse(storedCustomGroups)
                if (Array.isArray(parsed)) setCustomGroupsState(parsed)
            } catch {
                // ignore malformed storage
            }
        }

        const storedGroupFilter = localStorage.getItem(NEW_STUDENTS_GROUP_FILTER_STORAGE_KEY)
        if (storedGroupFilter) setGroupFilterState(storedGroupFilter)
    }, [])

    const setViewMode = (mode: ViewMode) => {
        setViewModeState(mode)
        localStorage.setItem(NEW_STUDENTS_VIEW_MODE_STORAGE_KEY, mode)
    }

    const setCustomGroups = (groups: string[]) => {
        setCustomGroupsState(groups)
        localStorage.setItem(NEW_STUDENTS_CUSTOM_GROUPS_STORAGE_KEY, JSON.stringify(groups))
    }

    const setGroupFilter = (value: string) => {
        setGroupFilterState(value)
        localStorage.setItem(NEW_STUDENTS_GROUP_FILTER_STORAGE_KEY, value)
    }

    const usedGroups = Array.from(new Set(
        newStudents.map(ns => ns.meta?.group).filter((g): g is string => !!g)
    )).sort()

    useEffect(() => {
        const stillCustom = customGroups.filter(g => !usedGroups.includes(g))
        if (stillCustom.length !== customGroups.length) {
            setCustomGroups(stillCustom)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newStudents])

    const allGroups = Array.from(new Set([...usedGroups, ...customGroups])).sort()

    const handleCreateGroup = (name: string) => {
        const trimmed = name.trim()
        if (!trimmed) return
        if (allGroups.some(g => g.toLowerCase() === trimmed.toLowerCase())) {
            toast.error("Gruppen finnes allerede")
            return
        }
        setCustomGroups([...customGroups, trimmed])
    }

    const handleDeleteGroup = (name: string) => {
        setCustomGroups(customGroups.filter(g => g !== name))
    }

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

    // filteredStudents (above) excludes group filtering so the Grupper board always shows every group.
    // groupFilteredStudents additionally narrows by the group dropdown, for the Tabell/Kort views.
    let groupFilteredStudents = filteredStudents
    if (groupFilter === "ungrouped") {
        groupFilteredStudents = filteredStudents.filter(ns => !ns.meta?.group)
    } else if (groupFilter !== "all") {
        groupFilteredStudents = filteredStudents.filter(ns => ns.meta?.group === groupFilter)
    }

    return (<div className="w-full max-w-full bg-white dark:bg-black rounded-sm shadow-lg flex flex-col items-center justify-center overflow-hidden">
        <div className="flex flex-col space-y-2 items-center w-full bg-stone-100 dark:bg-stone-900 rounded-md p-2">
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
            {viewMode !== "groups" && (
                <div className="flex items-center space-x-2 m-4">
                    <Label htmlFor="group-filter">Filtrer på gruppe</Label>
                    <select
                        id="group-filter"
                        value={groupFilter}
                        onChange={(e) => setGroupFilter(e.target.value)}
                        className="border border-gray-200 dark:border-gray-800 rounded-md px-2 py-1 text-sm bg-white dark:bg-black"
                    >
                        <option value="all">Alle</option>
                        <option value="ungrouped">Ugruppert</option>
                        {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
            )}
            <div className="flex items-center space-x-1 rounded-md border border-gray-200 dark:border-gray-800 p-1 mb-2">
                <Button
                    type="button"
                    size="sm"
                    variant={viewMode === "table" ? "secondary" : "ghost"}
                    onClick={() => setViewMode("table")}
                    className="gap-1"
                >
                    <TableIcon className="w-4 h-4" />
                    Tabell
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={viewMode === "cards" ? "secondary" : "ghost"}
                    onClick={() => setViewMode("cards")}
                    className="gap-1"
                >
                    <LayoutGrid className="w-4 h-4" />
                    Kort
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={viewMode === "groups" ? "secondary" : "ghost"}
                    onClick={() => setViewMode("groups")}
                    className="gap-1"
                >
                    <Folder className="w-4 h-4" />
                    Grupper
                </Button>
            </div>
        </div>

        {viewMode === "table" ? (
            <div className="overflow-x-auto w-full max-w-full">
            <Table>
                    <TableCaption>Arbeidsoversikt for ny elev ({groupFilteredStudents.length})</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Telefonnummer & dato opprettet</TableHead>
                                <TableHead>Kilde</TableHead>
                                <TableHead>Gruppe</TableHead>
                                <TableHead>Jeg har ringt</TableHead>
                                <TableHead>Ny elev har svart</TableHead>
                                <TableHead>Ny elev er en referanse</TableHead>
                                <TableHead>Referansen er betalt</TableHead>
                                <TableHead>Ny elev har fullført oppstart</TableHead>
                                <TableHead>Kommentarer</TableHead>
                                <TableHead>Slett ny elev</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="">
                            {groupFilteredStudents.map( ns => {
                                return <NewStudentRow key={ns.new_student_id} ns={ns} onDelete={onDelete}/>
                            })}
                        </TableBody>
            </Table>
            </div>
        ) : viewMode === "cards" ? (
            <div className="w-full max-w-full p-4 bg-stone-100 dark:bg-stone-900 rounded-md">
                <p className="text-sm text-muted-foreground mb-4 text-center">Arbeidsoversikt for ny elev ({groupFilteredStudents.length})</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {groupFilteredStudents.map( ns => {
                        return <NewStudentCard key={ns.new_student_id} ns={ns} onDelete={onDelete}/>
                    })}
                </div>
            </div>
        ) : (
            <GroupsBoard
                students={filteredStudents}
                allGroups={allGroups}
                onSetGroup={onSetGroup}
                onDelete={onDelete}
                onCreateGroup={handleCreateGroup}
                onDeleteGroup={handleDeleteGroup}
            />
        )}
    </div>)
}


function useNewStudentState(ns: NewStudent, onDelete: (newStudentId: string) => void) {
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
    const [comments, setComments] = useState<string>(ns.comments ?? "")







    const saveUpdates = async (overrides: Record<string, unknown> = {}) => {
        try {
            await apiFetch("/update-new-student", {
                method: "POST",
                body: {
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
                    ...overrides,
                }
            })
            toast.success("Oppdateringer lagret")
        } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Error while saving updates to new student")
        }
    }

    const handleSetCalled = (value :string) => {
        const isCalled = value === "Ja"; // Convert value to boolean
        const newCalledAt = new Date()
        setHasCalled(isCalled)
        setCalledAt(newCalledAt)
        saveUpdates({ has_called: isCalled, called_at: newCalledAt })
    }

    const handleSetAnswered = (value :string) => {
        const isAnswered = value === "Ja"; // Convert value to boolean
        const newAnsweredAt = new Date()
        setHasAnswered(isAnswered)
        setAnsweredAt(newAnsweredAt)
        saveUpdates({ has_answered: isAnswered, answered_at: newAnsweredAt })
    }

    const handleSetFinishedOnboarding = (value :string) => {
        const isFinishedOnboarding = value === "Ja"; // Convert value to boolean
        const newFinishedOnboardingAt = new Date()
        setHasFinishedOnboarding(isFinishedOnboarding)
        setFinishedOnboardingAt(newFinishedOnboardingAt)
        saveUpdates({ has_finished_onboarding: isFinishedOnboarding, finished_onboarding_at: newFinishedOnboardingAt })
    }

    const handleSetPaidReferee = (value :string) => {
        const isPaidReferee = value === "Ja"; // Convert value to boolean
        const newPaidRefereeAt = new Date()
        setPaidReferee(isPaidReferee)
        setPaidRefereeAt(newPaidRefereeAt)
        saveUpdates({ paid_referee: isPaidReferee, paid_referee_at: newPaidRefereeAt })
    }

    const handleDelete = async () => {
        try {
            await apiFetch("/hide-new-student-from-new-students-table", {
                method: "POST",
                body: {
                    new_student_id : ns.new_student_id
                }
            })
            toast.success("Eleven er slettet")
            onDelete(ns.new_student_id)
        } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Error while deleting new student")
        }
    }

    return {
        hasCalled, hasAnswered, fromReferal, refereePhone, paidReferee, hasFinishedOnboarding, comments, setComments,
        handleSetCalled, handleSetAnswered, handleSetFinishedOnboarding, handleSetPaidReferee, saveUpdates, handleDelete,
    }
}

const DeleteNewStudentDialog = ({ onDelete }: { onDelete: () => void }) => (
    <AlertDialog>
        <AlertDialogTrigger asChild><Button variant="destructive">Slett ny elev</Button></AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Er du sikker på at du vil slette den nye eleven?</AlertDialogTitle>
            <AlertDialogDescription>
                Dette kan ikke angres. Den nye eleven og all tilhørende data slettes permanent fra databasen.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Kanseler</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
)

function NewStudentRow({ ns, onDelete }: { ns: NewStudent, onDelete: (newStudentId: string) => void }) {
    const {
        hasCalled, hasAnswered, fromReferal, refereePhone, paidReferee, hasFinishedOnboarding, comments, setComments,
        handleSetCalled, handleSetAnswered, handleSetFinishedOnboarding, handleSetPaidReferee, saveUpdates, handleDelete,
    } = useNewStudentState(ns, onDelete)

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

        <TableCell className="">{ns.meta?.source ?? "-"}</TableCell>

        <TableCell className="">{ns.meta?.group ?? "-"}</TableCell>

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
            <Textarea placeholder="Noter ned viktig info om eleven" value={comments} onChange={(e) => setComments(e.target.value)} onBlur={() => saveUpdates()} rows={6}/>
        </TableCell>

        <TableCell>
            <DeleteNewStudentDialog onDelete={handleDelete} />
        </TableCell>
    </TableRow>
    )
}

function NewStudentCard({ ns, onDelete }: { ns: NewStudent, onDelete: (newStudentId: string) => void }) {
    const {
        hasCalled, hasAnswered, fromReferal, refereePhone, paidReferee, hasFinishedOnboarding, comments, setComments,
        handleSetCalled, handleSetAnswered, handleSetFinishedOnboarding, handleSetPaidReferee, saveUpdates, handleDelete,
    } = useNewStudentState(ns, onDelete)

    return (
        <Card className={`flex flex-col h-full w-full shadow-md ${ns.has_finished_onboarding ? "text-gray-400" : ""}`}>
            <CardHeader>
                <CardTitle className="text-base font-medium">
                    {ns.phone.slice(0, 3)} {ns.phone.slice(3, 5)} {ns.phone.slice(5, 10)} {ns.phone.slice(10, 13)}
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("nb-NO", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "Europe/Oslo"
                    }).format(new Date(ns.created_at))}
                    {" "}
                    ({Math.floor((Date.now() - new Date(ns.created_at).getTime()) / (1000 * 60 * 60 * 24))} dager siden)
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="text-sm">
                    <span className="font-semibold">Kilde:</span> {ns.meta?.source ?? "-"}
                </div>

                <div className="flex items-center justify-between gap-2">
                    <Label className="text-sm font-semibold">Jeg har ringt:</Label>
                    <RadioGroup onValueChange={handleSetCalled} defaultValue={ns.has_called? "Ja" : "Nei"} value={hasCalled? "Ja" : "Nei"} className="flex flex-row gap-3">
                        <RadioGroupItem value="Ja" className="text-green-400"></RadioGroupItem>
                        <RadioGroupItem value="Nei" className="text-red-400 "></RadioGroupItem>
                    </RadioGroup>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <Label className="text-sm font-semibold">Ny elev har svart:</Label>
                    <RadioGroup defaultValue={ns.has_answered? "Ja" : "Nei"} value={hasAnswered? "Ja" : "Nei"} onValueChange={handleSetAnswered} className="flex flex-row gap-3">
                        <RadioGroupItem value="Ja" className="text-green-400"></RadioGroupItem>
                        <RadioGroupItem value="Nei" className="text-red-400"></RadioGroupItem>
                    </RadioGroup>
                </div>

                <div className="space-y-1">
                    <Label className="text-sm font-semibold">Ny elev er en referanse:</Label>
                    <div className="text-sm">
                        {fromReferal ? (
                            <span className="text-gray-400">Fra {ns.referee_name} <br/> tlf: {refereePhone}
                            <br/> kontoNr: {ns.referee_account_number}
                            </span>
                        ) : (
                            <span className="text-gray-400">Nei</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <Label className="text-sm font-semibold">Referansen er betalt:</Label>
                    <RadioGroup defaultValue={ns.paid_referee? "Ja" : "Nei"} value={paidReferee? "Ja" : "Nei"} onValueChange={handleSetPaidReferee} className="flex flex-row gap-3">
                        <RadioGroupItem value="Ja" className="text-green-400"></RadioGroupItem>
                        <RadioGroupItem value="Nei" className="text-red-400"></RadioGroupItem>
                    </RadioGroup>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <Label className="text-sm font-semibold">Ny elev har fullført oppstart:</Label>
                    <RadioGroup defaultValue={ns.has_finished_onboarding? "Ja" : "Nei"} value={hasFinishedOnboarding? "Ja" : "Nei"} onValueChange={handleSetFinishedOnboarding} className="flex flex-row gap-3">
                        <RadioGroupItem value="Ja" className="text-green-400"></RadioGroupItem>
                        <RadioGroupItem value="Nei" className="text-red-400"></RadioGroupItem>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-semibold">Kommentarer:</Label>
                    <Textarea placeholder="Noter ned viktig info om eleven" value={comments} onChange={(e) => setComments(e.target.value)} onBlur={() => saveUpdates()} rows={8}/>
                </div>

                <DeleteNewStudentDialog onDelete={handleDelete} />
            </CardContent>
        </Card>
    )
}

const UNGROUPED_KEY = "__ungrouped__"

function GroupsBoard({
    students,
    allGroups,
    onSetGroup,
    onCreateGroup,
    onDeleteGroup,
    onDelete,
}: {
    students: NewStudent[]
    allGroups: string[]
    onSetGroup: (newStudentId: string, group: string | null) => void
    onCreateGroup: (name: string) => void
    onDeleteGroup: (name: string) => void
    onDelete: (newStudentId: string) => void
}) {
    const [newGroupName, setNewGroupName] = useState("")
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

    const toggleCollapsed = (key: string) => {
        setCollapsed(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, group: string | null) => {
        e.preventDefault()
        const newStudentId = e.dataTransfer.getData("text/plain")
        if (newStudentId) onSetGroup(newStudentId, group)
    }

    const columns: { key: string, title: string, group: string | null }[] = [
        { key: UNGROUPED_KEY, title: "Ugruppert", group: null },
        ...allGroups.map(g => ({ key: g, title: g, group: g })),
    ]

    return (
        <div className="w-full max-w-full p-4 bg-stone-100 dark:bg-stone-900 rounded-md">
            <div className="flex items-center gap-2 mb-4 justify-center">
                <Input
                    placeholder="Ny gruppe (f.eks. Digital)"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onCreateGroup(newGroupName)
                            setNewGroupName("")
                        }
                    }}
                    className="max-w-xs"
                />
                <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                        onCreateGroup(newGroupName)
                        setNewGroupName("")
                    }}
                    className="gap-1"
                >
                    <Plus className="w-4 h-4" />
                    Ny gruppe
                </Button>
            </div>

            <div className="flex flex-col gap-4 w-full">
                {columns.map(col => {
                    const studentsInColumn = students.filter(ns => (ns.meta?.group ?? null) === col.group)
                    const canDelete = col.group !== null && studentsInColumn.length === 0
                    const isCollapsed = collapsed.has(col.key)

                    return (
                        <div
                            key={col.key}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, col.group)}
                            className="w-full bg-white dark:bg-black rounded-md shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col"
                        >
                            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => toggleCollapsed(col.key)}
                                    className="flex items-center gap-1 font-semibold text-sm hover:opacity-70"
                                >
                                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    {col.title} ({studentsInColumn.length})
                                </button>
                                {col.group !== null && (
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        disabled={!canDelete}
                                        onClick={() => onDeleteGroup(col.group as string)}
                                        title={canDelete ? "Slett gruppe" : "Flytt ut alle elever før du sletter gruppen"}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                            {!isCollapsed && (
                                <div
                                    className="grid gap-3 p-3 min-h-24"
                                    style={{ gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))" }}
                                >
                                    {studentsInColumn.map(ns => (
                                        <div
                                            key={ns.new_student_id}
                                            draggable
                                            onDragStart={(e) => e.dataTransfer.setData("text/plain", ns.new_student_id)}
                                            className="cursor-grab active:cursor-grabbing"
                                        >
                                            <NewStudentCard ns={ns} onDelete={onDelete} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}