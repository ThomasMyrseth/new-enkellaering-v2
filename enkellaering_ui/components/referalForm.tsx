"use client"
import { Button } from "@/components/ui/moving-border";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { Terminal } from "lucide-react"
 
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
 
const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;


export default function ReferalForm() {
    const [errorMessage, setErrorMessage] = useState<boolean | null>(null);
    const [validPhone, setValidPhone] = useState<boolean | null>(null)
    const [referalPhone, setReferalPhone] = useState<string>("");
    const [refereePhone, setRefereePhone] = useState<string>("");
    const [refereeName, setRefereeName] = useState<string>("");



    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);

        if (referalPhone.length!=8 || refereePhone.length!=8 || refereeName.length<3) {
            setValidPhone(false)
            return
        }
        else {
            setValidPhone(true)
        }

        const response = await fetch(`${BASEURL}/submit-new-referal`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "referal_phone": referalPhone,
                "referee_phone": refereePhone,
                "referee_name": refereeName
            })
        })

        if (!response.ok) {
            setErrorMessage(true)
            alert("En feil har skjedd. Venligst prøv igjen!")
        }
        else {
            setErrorMessage(false) //we have success
            setReferalPhone('')
            setRefereePhone('')
            setRefereeName('')
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

        <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[5px] dark:p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                Send inn
            </span>
        </button>
        
      </form>
    </div>
    </>)
}



const LabelInputContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};
    
    
    
