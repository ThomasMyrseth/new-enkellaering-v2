"use client"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
    const router = useRouter()
    localStorage.removeItem('token')

    router.push('/')
    return(<p>Logger ut...</p>)
}