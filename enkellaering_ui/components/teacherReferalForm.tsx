"use client"
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { event } from "./facebookPixel/fpixel";

import { Terminal } from "lucide-react"
 
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { toast } from "sonner";
import { Button } from "./ui/button";
 
const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;


export default function TeacherReferalForm({token} : {token: string}) {

    const [errorMessage, setErrorMessage] = useState<boolean | null>(null);
    const [validPhone, setValidPhone] = useState<boolean | null>(null)

    const [referalPhone, setReferalPhone] = useState<string>("");
    const [referalEmail, setReferalEmail] = useState<string>("");
    const [referalName, setReferalName] = useState<string>("");

    const [isSendDisabled, setIsSendDisabled] = useState<boolean>(false);




    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);
        setIsSendDisabled(true)

        if (
          referalPhone.trim().length !== 8
        ) {
            setValidPhone(false)
            setIsSendDisabled(false)
            return
        }
        else {
            setValidPhone(true)
        }

        event("submit-new-referal")

        const response = await fetch(`${BASEURL}/submit-new-teacher-referal`, {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "referal_phone": referalPhone.trim(),
                "referal_email": referalEmail.trim(),
                "referal_name": referalName.trim(),
            })
        })

        if (!response.ok) {
            setErrorMessage(true)
            setIsSendDisabled(false)
            toast.error("En feil har skjedd. Venligst prøv igjen!")
        }
        else {
            setErrorMessage(false) //we have success
            setIsSendDisabled(false)
            setReferalPhone('')
            toast.success("Takk for at du vervet!")
        }
    }

    return(<>
    <div className="flex flex-col justify-center space-y-4 items-center text-center w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">Verv inn en lærer!</h2>
      <p className="text-neutral-600 text-sm mt-2 dark:text-neutral-300">
        Få betalt <span className="font-bold">2000 kr</span> for hver lærer du verver som blir aktiv!*
      </p>

        {errorMessage===false &&
            toast.success("Takk for at du vervet!")
        }

        {validPhone===false &&
            <Alert className="w-full md:w-1/2">
                <Terminal className="h-4 w-4" />
                <AlertTitle className="text-red-400">Skrev du noe feil?</AlertTitle>
                <AlertDescription>
                    Sjekk at nummerene er på 8 siffer og at navn-feltet ikke er tomt
                </AlertDescription>
            </Alert>
        }


      <form className="my-8 w-full md:w-1/2" onSubmit={handleSubmit}>

        {/* referal name field */}
        <LabelInputContainer>
          <Label htmlFor="name">Den vervedes navn**</Label>
          <Input
            id="referal_name"
            placeholder="Kurt Nilsen"
            type="text"
            value={referalName}
            onChange={(e) => setReferalName(e.target.value)}
            className={cn(errorMessage ? "border-red-500" : "")}
          />
        </LabelInputContainer>

        {/* referal phone field */}
        <LabelInputContainer>
          <Label htmlFor="phone">Den vervedes telefonnummer**</Label>
          <Input
            id="referal_phone"
            placeholder="87654321"
            type="phone"
            value={referalPhone}
            onChange={(e) => setReferalPhone(e.target.value)}
            className={cn(errorMessage ? "border-red-500" : "")}
          />
        </LabelInputContainer>

        {/* referal email field */}
        <LabelInputContainer>
          <Label htmlFor="email">Den vervedes epost</Label>
          <Input
            id="referal_email"
            placeholder="example@example.com"
            type="email"
            value={referalEmail}
            onChange={(e) => setReferalEmail(e.target.value)}
            className={cn(errorMessage ? "border-red-500" : "")}
          />
        </LabelInputContainer>

        <Button type="submit" variant="default" disabled={isSendDisabled} className="w-full h-10">
            Verv
        </Button>
        
      </form>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        * Du får betalt neste lønning etter at den vervede har signert sin arbeidskontrakt
        <br/>** Obligatoriske felter
      </p>
    </div>
    </>)
}



const LabelInputContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};
    
    
    
