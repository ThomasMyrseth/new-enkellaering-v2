"use client"

import { InactiveStudents } from "../inactiveStudents"
import { FrozenStudents } from "../frozenStudents"
import { ResignedTeachers } from "../resignedTeachers"
import { FrozenTeachers } from "../frozenTeachers"

export default function AdminFrozenPage() {
    return (<>
        <InactiveStudents />
        <FrozenStudents />
        <br/><br/><br/><br/><br/><br/><br/>
        <ResignedTeachers />
        <FrozenTeachers />
    </>)
}
