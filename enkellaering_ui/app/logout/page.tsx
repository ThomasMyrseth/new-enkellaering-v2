"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import React from "react"

export default function LogoutPage() {
    const router = useRouter()
    useEffect(() => {
        localStorage.removeItem('token')
        router.push('/')
    }, [router])

    router.push('/')
    return(<p>Logger ut...</p>)
}