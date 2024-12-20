"use client"
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Terminal } from "lucide-react"
 
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
 
const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;


export default function NewStudentForm() {
    const [errorMessage, setErrorMessage] = useState<boolean | null>(null);
    const [validPhone, setValidPhone] = useState<boolean | null>(null)
    const [phone, setPhone] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);

        if (phone.length!=8) {
            setValidPhone(false)
            return
        }
        else {
            setValidPhone(true)
        }

        const response = await fetch(`${BASEURL}/submit-new-student`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "phone": phone
            })
        })

        if (!response.ok) {
            setErrorMessage(true)
            alert("En feil har skjedd. Venligst prøv igjen!")
        }
        else {
            setErrorMessage(false) //we have success
            setPhone('')
        }
    }

    return(<>
    <div className="max-w-md rounded-lg w-full mx-auto md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
        
        <h2 className="text-3xl font-bold relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">Bestill privatundervisning</h2>
        <p>Legg igjen nummeret ditt her, vi ringer deg innen 24 timer for å avtale oppstart.</p>

        {errorMessage===false &&
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle className="text-green-400">Tusen takk!</AlertTitle>
                <AlertDescription>
                    Vi har mottat telefonnummeret ditt. Vi ringer deg innen kort tid
                </AlertDescription>
            </Alert>
        }

        {validPhone===false &&
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle className="text-red-400">Skrev du noe feil?</AlertTitle>
                <AlertDescription>
                    Sjekk at nummeret er på 8 siffer, uten mellomrom, uten landskode
                </AlertDescription>
            </Alert>
        }


      <form className="my-8" onSubmit={handleSubmit}>
        {/* phone field */}
        <LabelInputContainer>
          <Label htmlFor="phone">Ditt telefonnummer</Label>
          <Input
            id="phone"
            placeholder="12345678"
            type="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
    
    
    
