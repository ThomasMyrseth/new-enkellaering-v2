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
import { toast } from "sonner";
  
const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";

export const WantMoreStudents = ({teacher} : {teacher :Teacher}) => {
  const [digitalTutoring, setDigitalTutoring] = useState<boolean>(teacher.digital_tutouring);
  const [physicalTutoring, setPhysicalTutoring] = useState<boolean>(teacher.physical_tutouring);

  const handleDigital = () => {
    const newVal = !digitalTutoring
    setDigitalTutoring(newVal)
    setWantMoreStudents(physicalTutoring, newVal)
  }

  const handlePhysical = () => {
    const newVal = !physicalTutoring
    setPhysicalTutoring(newVal)
    setWantMoreStudents(newVal, digitalTutoring)
  }

    return(<>
    <Card className="flex flex-col items-center w-full">
      <CardHeader>
        <CardTitle>Ønsker du flere elever?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mt-2 space-x-1">
          <Switch checked={digitalTutoring} onCheckedChange={handleDigital}/>
          <Label>Jeg ønsker flere digitale elever</Label>
        </div>
        <div className="flex items-center mt-2 space-x-1">
          <Switch checked={physicalTutoring} onCheckedChange={handlePhysical}/>
          <Label>Jeg ønsker flere fysiske elever</Label>
        </div>            
      </CardContent>
    
    </Card>
    </>)
}

const setWantMoreStudents = async (p :boolean, d: boolean) => {
    const token = localStorage.getItem('token')

    const response = await fetch(`${BASEURL}/toggle-wants-more-students`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`, // Correct Authorization header format
            "Content-Type": "application/json"  // Ensure the server knows it's JSON
        },
        body: JSON.stringify({ physical: p, digital: d}) // Use body instead of data
    });

    if (!response.ok) {
        alert("En feil skjedde når du satte om du ønsker flere elever eller ei");
    }

    toast("Oppdatert dine undervisningspreferanser");
};