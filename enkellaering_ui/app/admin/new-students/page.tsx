"use client"


import { ManualSubmitForm } from "../manualSubmitForm"
import { NewStudentsWorkflow } from "../newStudentsWorkflow"

export default function AdminNewStudentsPage() {
    return (<>
        <NewStudentsWorkflow />
        <ManualSubmitForm />
    </>)
}
