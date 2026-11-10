import { Classes } from "../types"
import { TeacherStudent } from "@/types/teacher-student"

export function computeClassDuration(c: Classes) {
    const startedAt = new Date(c.started_at)
    const endedAt = new Date(c.ended_at)
    const totalDurationMillis = endedAt.getTime() - startedAt.getTime()
    const durationHours = Math.floor(totalDurationMillis / (1000 * 60 * 60))
    const durationMinutes = Math.round((totalDurationMillis % (1000 * 60 * 60)) / (1000 * 60))
    const totalDurationHours = durationHours + durationMinutes / 60
    return { startedAt, endedAt, totalDurationMillis, durationHours, durationMinutes, totalDurationHours }
}

// Group sessions bill at least 700 kr/hour total. A group row with 1 student
// (e.g. twins sharing one account) pays the full 700. Legacy null = assume a real group.
export function studentHourlyRate(c: Pick<Classes, "groupclass" | "number_of_students">) {
    if (!c.groupclass) return 540
    return (c.number_of_students ?? 2) < 2 ? 700 : 350
}

export function computeClassInvoiceAmount(c: Classes, teacherStudents: TeacherStudent[]) {
    const { totalDurationHours } = computeClassDuration(c)

    let invoiceAmount = Math.round(totalDurationHours * studentHourlyRate(c))

    const ts = teacherStudents.find((ts: TeacherStudent) =>
        ts.student?.user_id === c.student_user_id &&
        ts.teacher?.user_id === c.teacher_user_id
    )
    invoiceAmount += Number(ts?.relation.travel_pay_from_student || 0)

    return invoiceAmount
}

export function computeClassTotals(myClasses: Classes[], teacherStudents: TeacherStudent[]) {
    let totalUninvoicedStudent = 0
    let totalUninvoicedHoursStudent = 0
    let totalInvoicedStudent = 0
    let totalInvoicedHoursStudent = 0
    let totalTravelPayFromStudent = 0

    myClasses.forEach((c: Classes) => {
        const { totalDurationHours } = computeClassDuration(c)

        let invoiceAmount = totalDurationHours * studentHourlyRate(c)

        if (!c.invoiced_student) {
            totalUninvoicedHoursStudent += totalDurationHours
            totalUninvoicedStudent += invoiceAmount

            const ts = teacherStudents.find((ts: TeacherStudent) =>
                ts.student?.user_id === c.student_user_id &&
                ts.teacher?.user_id === c.teacher_user_id
            )
            const travelPayFromStudent = Number(ts?.relation.travel_pay_from_student || 0)
            totalTravelPayFromStudent += travelPayFromStudent
            invoiceAmount += travelPayFromStudent
        } else {
            totalInvoicedHoursStudent += totalDurationHours
            totalInvoicedStudent += invoiceAmount
        }
    })

    return {
        totalUninvoicedStudent: Math.round(totalUninvoicedStudent),
        totalUninvoicedHoursStudent: Math.round(totalUninvoicedHoursStudent * 10) / 10,
        totalInvoicedStudent: Math.round(totalInvoicedStudent),
        totalInvoicedHoursStudent: Math.round(totalInvoicedHoursStudent * 10) / 10,
        totalTravelPayFromStudent,
    }
}

export function computeRecentActivity(myClasses: Classes[]) {
    const today = new Date()
    const fourWeeksAgo = new Date(today)
    fourWeeksAgo.setDate(today.getDate() - 28)

    let hoursOfClassesLastFourWeeks = 0
    let numberOfCanselledClassesLastFourWeeks = 0

    myClasses.forEach((c: Classes) => {
        const { startedAt, totalDurationMillis } = computeClassDuration(c)

        if (startedAt.getTime() > fourWeeksAgo.getTime()) {
            hoursOfClassesLastFourWeeks += totalDurationMillis / (1000 * 60 * 60)

            if (c.was_canselled === true) {
                numberOfCanselledClassesLastFourWeeks += 1
            }
        }
    })

    return {
        hoursOfClassesLastFourWeeks: Math.round(hoursOfClassesLastFourWeeks * 10) / 10,
        numberOfCanselledClassesLastFourWeeks,
    }
}
