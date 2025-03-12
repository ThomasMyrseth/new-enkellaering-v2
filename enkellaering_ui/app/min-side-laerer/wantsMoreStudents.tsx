"use client"


import { Switch } from "@/components/ui/switch"
import { useState } from "react";
import { Teacher } from "../admin/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
  
const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

export const WantMoreStudents = ({teacher} : {teacher :Teacher}) => {
    const [wantMore, setWantMore] = useState<boolean>(teacher.wants_more_students);

    const handleToggle = async () => {
        const newState = !wantMore;
        setWantMore(newState);
        await setWantMoreStudents(newState); // Update on the backend
    };

    return(<>

    <Card className="flex flex-col items-center w-3/4 m-4">
      <CardHeader>
        <CardTitle>Ønsker du flere elever?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
            <Switch id="more-students" checked={wantMore} onCheckedChange={handleToggle}/>
            <Label htmlFor="more-students" className={`${wantMore ? '' : 'text-neutral-400'}`}>Jeg ønsker meg flere elever</Label>
        </div>
      </CardContent>
    
    </Card>
    </>)
}

const setWantMoreStudents = async (yesOrNo: boolean) => {
    const token = localStorage.getItem('token')

    const response = await fetch(`${BASEURL}/toggle-wants-more-students`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`, // Correct Authorization header format
            "Content-Type": "application/json"  // Ensure the server knows it's JSON
        },
        body: JSON.stringify({ 'wants_more_students': yesOrNo }) // Use body instead of data
    });

    if (!response.ok) {
        alert("En feil skjedde når du satte om du ønsker flere elever eller ei");
    }

    return true;
};