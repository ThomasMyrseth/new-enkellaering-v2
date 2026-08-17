"use client"

import Link from "next/link"

import { DailyRevenueChart } from "./dailyRevenue"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const SECTIONS = [
    {
        href: "/admin/revenue",
        title: "Inntekt & analyse",
        description: "Detaljert analyse, quiz-administrasjon og gratishjelp",
    },
    {
        href: "/admin/new-students",
        title: "Nye elever",
        description: "Registrering og onboarding av nye elever",
    },
    {
        href: "/admin/active",
        title: "Aktive elever & lærere",
        description: "Oppgaver, timeoversikt og lærertildeling",
    },
    {
        href: "/admin/frozen",
        title: "Frosne & inaktive",
        description: "Frosne/inaktive elever og fratrådte lærere",
    },
]

export default function AdminOverviewPage() {
    return (<>
        <DailyRevenueChart />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SECTIONS.map((section) => (
                <Link key={section.href} href={section.href}>
                    <Card className="h-full hover:border-stone-400 dark:hover:border-stone-600 transition-colors">
                        <CardHeader>
                            <CardTitle>{section.title}</CardTitle>
                            <CardDescription>{section.description}</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            ))}
        </div>
    </>)
}
