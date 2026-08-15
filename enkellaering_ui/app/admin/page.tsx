"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation";

import { DailyRevenueChart } from "./dailyRevenue";
import { TeacherName } from "./teacherName";
import { NewStudentsWorkflow } from "./newStudentsWorkflow";
import { PreviousClassesForEachTeacher } from "./previousClassesForEachTeacher";
import { PreviousClassesForEachStudent } from "./previousClassesForEachStudent";
import { StudentsWithoutAnyTeachers } from "./studentsWithoutTeacher";
import Quiz from "./quiz/main";
import AnalyticsOverview from "./analyticsOverview";

import { InactiveStudents } from "./inactiveStudents";
import { ResignedTeachers } from "./resignedTeachers";
import { TasksWorkflow } from "./tasksWorkflow";
import { TeacherTasksWorkflow } from "./teacherTasksWorkflow";
import { HelpAdminPanel } from "./helpAdmin";
import { toast } from "sonner";
import { useTeacher } from "@/hooks/use-teacher";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";




export default function AdminPage() {
    const token = localStorage.getItem('token')!
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080"
    const router = useRouter()
    const [teacher, loading, error] = useTeacher()

    if (error) toast.error("Failed to fetch teacher: " + error);

    //redirect if the current logged in teacher is not an admin
    useEffect(() => {
      if (loading) return

      if (!teacher) {
        console.log("error fetching teacher!")
        router.push("/error")
        return
      }
      if (!teacher.admin) {
        console.log(`${teacher.firstname} er ikke admin!`)
        router.push("/login-laerer")
      }
    },[router, loading, teacher])

    //this user is an admin
    if (loading || !teacher) {
        return (
            <div className="w-full min-h-screen max-w-full bg-stone-100 dark:bg-slate-950 p-4 space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        )
    }

    return (<div className="w-full min-h-screen max-w-full bg-stone-100 dark:bg-slate-950 ">
        <TeacherName teacher={teacher}/>
        <div className="w-full max-w-full p-4 space-y-10">
          <Link href="/admin/manual-submit"><Button variant="outline">Manuell registrering av ny elev</Button></Link>
          <AnalyticsOverview />
          <TasksWorkflow />
          <TeacherTasksWorkflow />
          <StudentsWithoutAnyTeachers token={token} BASEURL={BASEURL} />
          <DailyRevenueChart />
          <PreviousClassesForEachTeacher />
          <PreviousClassesForEachStudent />
          <NewStudentsWorkflow />
          <InactiveStudents />
          <ResignedTeachers />
          <Quiz/>
          <HelpAdminPanel token={token} />

        </div>
        <div className="h-10"> </div>

    </div>)
}




