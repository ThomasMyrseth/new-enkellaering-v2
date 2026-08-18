"use client"

import { useEffect, useState } from "react"
import AnalyticsOverview from "../analyticsOverview"
import Quiz from "../quiz/main"
import { HelpAdminPanel } from "../helpAdmin"

export default function AdminRevenuePage() {
    const [token, setToken] = useState<string | null>(null)

    useEffect(() => {
        setToken(localStorage.getItem('token'))
    }, [])

    if (!token) return null

    return (<>
        <AnalyticsOverview />
        <Quiz />
        <HelpAdminPanel token={token} />
    </>)
}
