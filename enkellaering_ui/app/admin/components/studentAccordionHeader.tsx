"use client"
import { AccordionTrigger } from "@/components/ui/accordion"
import { Classes, Student, Teacher } from "../types"
import { computeRecentActivity } from "./calculations"

export const StudentAccordionHeader = ({
    student,
    myClasses,
    myTeachers,
}: {
    student: Student,
    myClasses: Classes[],
    myTeachers: Teacher[],
}) => {
    const { hoursOfClassesLastFourWeeks, numberOfCanselledClassesLastFourWeeks } = computeRecentActivity(myClasses)

    return (
        <AccordionTrigger className={`w-full h-full p-4 ${numberOfCanselledClassesLastFourWeeks >= 2 ? 'bg-red-50 dark:bg-red-950' : ''}`}>
            <div className="flex flex-row justify-between items-center w-full pr-2">
                <p className="text-start">
                    {student.firstname_parent} {student.lastname_parent} <br/>
                    & {student.firstname_student} {student.lastname_student} <br/>
                    {student.phone_parent} | {student.phone_student}
                </p>
                <div className="flex flex-col">
                    {!myTeachers.length &&
                        <p className="text-red-500">
                            Mangler lærer
                        </p>
                    }
                    <p className={`
                            ${hoursOfClassesLastFourWeeks < student.est_hours_per_week * 4 ? "text-red-300" : "text-neutral-400"}
                        `}>
                        {hoursOfClassesLastFourWeeks}/{student.est_hours_per_week * 4}h siste fire uker
                    </p>
                    <p className="text-end text-neutral-400">
                        {parseInt(student.postal_code) < 4000 ? "Oslo" : "Trondheim"}
                    </p>
                </div>
            </div>
        </AccordionTrigger>
    )
}
