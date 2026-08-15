"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTeacher } from "@/hooks/use-teacher";
import { Skeleton } from "@/components/ui/skeleton";
import { ManualSubmitForm } from "../manualSubmitForm";

export default function ManualSubmitPage() {
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

    if (loading || !teacher) {
        return (
            <div className="w-full min-h-screen max-w-full bg-stone-100 dark:bg-slate-950 p-4 space-y-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-40 w-full" />
            </div>
        )
    }

    return (<div className="w-full min-h-screen max-w-full bg-stone-100 dark:bg-slate-950 p-4">
        <ManualSubmitForm/>
    </div>)
}
