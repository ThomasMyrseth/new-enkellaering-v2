"use client"
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";


export default function BestillLaerer() {
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
    const token = localStorage.getItem('token') || ''
    const searchParams = useSearchParams();
    const teacher_user_id = searchParams.get("teacher_user_id") || '';
    const router = useRouter()

    //redirect the user to sign up if they have not done so already
    if (!token) {
        router.push('/signup')
        return;
    }

    if (!teacher_user_id) {
        router.push('/')
        return;
    }

    //assume the user is logged in
    //set the requested teacher user id, then redirect them to min-side
    useEffect( () => {
        async function submitRequest() {
            try {
                const res = await submitNewRequest(BASEURL, token, teacher_user_id, false)

                if (res) {
                    router.push('/min-side')
                } else {
                    alert("Kunne ikke bestille læreren, prøv igjen")
                }
            }
            catch (error) {
                alert("Kunne ikke bestille lærer, prøv igjen")
            }
        }
        submitRequest()
    },[])


    return(<>
    <h1>Bestill lærer {teacher_user_id}</h1>
    </>)
}



const submitNewRequest = async (BASEURL: string, token: string, teacher_user_id: string, physical_or_digital :boolean) => {
    try {
        const res = await fetch(`${BASEURL}/request-new-teacher`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({teacher_user_id: teacher_user_id, physical_or_digital: physical_or_digital })
        });

        if (!res.ok) {
            console.log(`request failed: ${res.status} - ${res.statusText}`)
            throw new Error(`Error fetching: ${res.status} - ${res.statusText}`);
        }

        return await res.status
    } catch (error) {
        console.error("Request failed:", error);
        throw new Error("Failed to submit new teacher request");
    }
};