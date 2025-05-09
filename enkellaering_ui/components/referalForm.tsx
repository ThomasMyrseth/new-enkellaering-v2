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
 
const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;


export default function ReferalForm() {
    const [errorMessage, setErrorMessage] = useState<boolean | null>(null);
    const [validPhone, setValidPhone] = useState<boolean | null>(null)
    const [referalPhone, setReferalPhone] = useState<string>("");
    const [refereePhone, setRefereePhone] = useState<string>("");
    const [refereeName, setRefereeName] = useState<string>("");
    const [refereeAccountNumber, setRefereeAccountNumber] = useState<string>("")
    const [isSendDisabled, setIsSendDisabled] = useState<boolean>(false);




    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);
        setIsSendDisabled(true)

        if (
          referalPhone.trim().length !== 8 ||
          refereePhone.trim().length !== 8 ||
          refereeName.trim().length < 3 ||
          refereeAccountNumber.trim().length !== 11
        ) {
            setValidPhone(false)
            setIsSendDisabled(false)
            return
        }
        else {
            setValidPhone(true)
        }

        event("submit-new-referal")

        const response = await fetch(`${BASEURL}/submit-new-referal`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "referal_phone": referalPhone.trim(),
                "referee_phone": refereePhone.trim(),
                "referee_name": refereeName.trim(),
                "account_number": refereeAccountNumber.trim()
            })
        })

        if (!response.ok) {
            setErrorMessage(true)
            setIsSendDisabled(false)
            alert("En feil har skjedd. Venligst prøv igjen!")
        }
        else {
            setErrorMessage(false) //we have success
            setIsSendDisabled(false)
            setReferalPhone('')
            toast("Takk for at du vervet!")
        }
    }

    return(<>
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">Verv inn en elev!</h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Få betalt <span className="font-bold">1000 kr</span> for hver elev som starter med privatundervisning etter tips fra deg.
      </p>

        {errorMessage===false &&
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle className="text-green-400">Tusen takk!</AlertTitle>
                <AlertDescription>
                    Vi har mottatt infoen din og tar kontakt med den vervede. Vi betaler deg så fort de har hatt sin første time.
                </AlertDescription>
            </Alert>
        }

        {validPhone===false &&
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle className="text-red-400">Skrev du noe feil?</AlertTitle>
                <AlertDescription>
                    Sjekk at nummerene er på 8 siffer og at navn-feltet ikke er tomt
                </AlertDescription>
            </Alert>
        }


      <form className="my-8" onSubmit={handleSubmit}>
        {/* referal phone field */}
        <LabelInputContainer>
          <Label htmlFor="phone">Den vervedes telefonnummer</Label>
          <Input
            id="referal_phone"
            placeholder="87654321"
            type="phone"
            value={referalPhone}
            onChange={(e) => setReferalPhone(e.target.value)}
            className={cn(errorMessage ? "border-red-500" : "")}
          />
        </LabelInputContainer>

        {/* referee phone field */}
        <LabelInputContainer>
          <Label htmlFor="phone">Ditt telefonnummer</Label>
          <Input
            id="referee_phone"
            placeholder="12345678"
            type="phone"
            value={refereePhone}
            onChange={(e) => setRefereePhone(e.target.value)}
            className={cn(errorMessage ? "border-red-500" : "")}
          />
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="name">Ditt navn</Label>
          <Input
            id="name"
            placeholder="Kurt Nilsen"
            type="name"
            value={refereeName}
            onChange={(e) => setRefereeName(e.target.value)}
            className={cn(errorMessage ? "border-red-500" : "")}
          />
        </LabelInputContainer>


        <LabelInputContainer>
          <Label htmlFor="name">Ditt kontonummer</Label>
          <Input
            id="name"
            placeholder="1207.00.65543"
            type="name"
            value={refereeAccountNumber}
            onChange={(e) => setRefereeAccountNumber(e.target.value)}
            className={cn(errorMessage ? "border-red-500" : "")}
          />
        </LabelInputContainer>

        <button  type="submit" disabled={isSendDisabled} className="relative inline-flex h-12 overflow-hidden rounded-full p-[5px] dark:p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className={`${isSendDisabled ? "bg-slate-400" :"inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl"}`}>
                Verv
            </span>
        </button>
        
      </form>
    </div>
    </>)
}



const LabelInputContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};
    
    
    
