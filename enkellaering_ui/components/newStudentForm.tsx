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
import { toast } from "sonner";
import { event } from '@/components/facebookPixel/fpixel';
import { Button } from "./ui/button";
 
const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;


export default function NewStudentForm() {
    const [errorMessage, setErrorMessage] = useState<boolean | null>(null);
    //const [validPhone, setValidPhone] = useState<boolean | null>(null)
    const [phone, setPhone] = useState<string>("");
    const [isDisabled, setIsDisabled] = useState<boolean>(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setIsDisabled(true);

        e.preventDefault();
        setErrorMessage(null);

        event("submit-new-student")

        // if (phone.length!=8) {
        //     setValidPhone(false)
        //     return
        // }
        // else {
        //     setValidPhone(true)
        // }

        const response = await fetch(`${BASEURL}/submit-new-student`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "phone": phone
            })
        })

        if (!response.ok || !response) {
            setErrorMessage(true)
            alert("En feil har skjedd. Venligst prøv igjen!")
        }
        else {
            setErrorMessage(false) //we have success
            setPhone('')
            toast('Tusen takk! Vi ringer deg innen kort tid')
        }
        setIsDisabled(false)
    }

    return(<>
    <div className="max-w-md rounded-lg w-full mx-auto md:rounded-2xl p-4 md:p-8 shadow-none bg-white dark:bg-black">
        
        <h2 className="text-3xl font-bold relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">Bestill privatundervisning</h2>
        <p>Legg igjen nummeret ditt her, vi ringer deg innen 24 timer for å avtale oppstart.
        <br/>Eller ring oss selv på <span className="font-bold">+47 47184744</span></p>

        {errorMessage===false &&
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle className="text-green-400">Tusen takk!</AlertTitle>
                <AlertDescription>
                    Vi har mottat telefonnummeret ditt. Vi ringer deg innen kort tid
                </AlertDescription>
            </Alert>
        }

        {/* {/* {validPhone===false &&
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle className="text-red-400">Skrev du noe feil?</AlertTitle>
                <AlertDescription>
                    Sjekk at nummeret er på 8 siffer, uten mellomrom, uten landskode
                </AlertDescription>
            </Alert>
        } */}


      <form className="my-8 " onSubmit={handleSubmit}>
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

       <Button type="submit" variant="default" disabled={isDisabled} className="w-full h-10">
          Send inn
        </Button>
        
      </form>
    </div>
    </>)
}



const LabelInputContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};
    
    
    
