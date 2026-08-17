"use client"

import AnalyticsOverview from "../analyticsOverview"
import Quiz from "../quiz/main"
import { HelpAdminPanel } from "../helpAdmin"

export default function AdminRevenuePage() {
    const token = localStorage.getItem('token')!

    return (<>
        <AnalyticsOverview />
        <Quiz />
        <HelpAdminPanel token={token} />
    </>)
}
