"use client"
import React from "react";
import { EvervaultCard, Icon } from "@/components/ui/evervault-card";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

import { useState, useEffect } from "react";


export default function LaererPage() {
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;
    const [teacherFirstname, setTeacherFirstname] = useState<string>()
    const [teacherLastname, setTeacherLastname] = useState<string>()


    useEffect(() => {
        async function fetchTeacherName() {
            const response = await fetch(`${BASEURL}/get-teacher`, {
                credentials: "include",
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            if (response.ok) {
                const data = await response.json()
                setTeacherFirstname(data.firstname)
                setTeacherLastname(data.lastname)
            }

            else {
                alert(response.statusText)
            }
        }
        fetchTeacherName()
    },[])

    return (<>
        <BackgroundBeamsWithCollision>
            <EvervaultCard text={`Velkommen ${teacherFirstname} ${teacherLastname}`}/>
        </BackgroundBeamsWithCollision>
    </>)
}