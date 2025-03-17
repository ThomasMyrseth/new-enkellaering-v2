"use client"
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";


export default function BestillLaerer() {
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
    const token = localStorage.getItem('token') || ''
    const searchParams = useSearchParams();
    const teacherUserId = searchParams.get("teacher_user_id") || '';
    const physicalOrDigital = searchParams.get("physical_or_digital") === "true";
    const address = searchParams.get("address") || '';
    const comments = searchParams.get("comments") || '';
  

    const router = useRouter()

    //redirect the user to sign up if they have not done so already
    if (!token) {
        router.push('/signup')
        return;
    }

    if (!teacherUserId) {
        router.push('/')
        return;
    }

    //assume the user is logged in
    //set the requested teacher user id, then redirect them to min-side
    useEffect( () => {
        async function submitRequest() {
            try {
                const res = await submitNewRequest(BASEURL, token, teacherUserId, physicalOrDigital, address, comments)

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
    <h1>Bestill lærer {teacherUserId}</h1>
    </>)
}



const submitNewRequest = async (BASEURL: string, token: string, teacher_user_id: string, physical_or_digital :boolean, address :string, comments :string) => {
    try {
        const res = await fetch(`${BASEURL}/request-new-teacher`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(
                {teacher_user_id: teacher_user_id,
                physical_or_digital: physical_or_digital,
                address: address,
                comments: comments
            })
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