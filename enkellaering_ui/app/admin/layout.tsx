"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

import { TeacherName } from "./teacherName"
import { toast } from "sonner"
import { useTeacher } from "@/hooks/use-teacher"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
    { href: "/admin", label: "Oversikt" },
    { href: "/admin/revenue", label: "Inntekt & analyse" },
    { href: "/admin/new-students", label: "Nye elever" },
    { href: "/admin/active", label: "Aktive elever & lærere" },
    { href: "/admin/frozen", label: "Frosne & inaktive" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [teacher, loading, error] = useTeacher()

    if (error) toast.error("Failed to fetch teacher: " + error)

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
    }, [router, loading, teacher])

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
        <TeacherName teacher={teacher} />
        <nav className="w-full max-w-full px-4 flex flex-wrap gap-2 border-b border-stone-200 dark:border-stone-800 py-4">
            {NAV_ITEMS.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        pathname === item.href
                            ? "bg-stone-900 text-stone-50 dark:bg-stone-50 dark:text-stone-900"
                            : "text-stone-600 hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800"
                    )}
                >
                    {item.label}
                </Link>
            ))}
        </nav>
        <div className="w-full max-w-full p-4 space-y-10">
            {children}
        </div>
        <div className="h-10"> </div>
    </div>)
}
