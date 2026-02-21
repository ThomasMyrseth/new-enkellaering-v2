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


export default function WaitlistForm() {
    const [errorMessage, setErrorMessage] = useState<boolean | null>(null);
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [isDisabled, setIsDisabled] = useState<boolean>(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setIsDisabled(true);

        e.preventDefault();
        setErrorMessage(null);

        event("submit-gratis-hjelp-waitlist")

        const response = await fetch(`${BASEURL}/submit-waitlist`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "email": email,
                "phone": phone
            })
        })

        if (!response.ok || !response) {
            setErrorMessage(true)
            toast.error("En feil har skjedd. Venligst prøv igjen!")
        }
        else {
            setErrorMessage(false) //we have success
            setEmail('')
            setPhone('')
            toast.success('Tusen takk! Vi sender deg en epost når neste økt er klar')
        }
        setIsDisabled(false)
    }

    return(<>
    <div className="max-w-4xl rounded-lg w-full mx-auto md:rounded-2xl p-4 md:p-8 shadow-none bg-white dark:bg-black">
        
        <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">Ønsker du å få en påminnelse når neste økt er klar?</h2>
        <p className="text-neutral-600 dark:text-neutral-400 mt-2">Legg igjen kontaktinformasjonen din her. Vi tar kontakt med deg 24 timer før neste økt starter.</p>

        {errorMessage===false &&
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle className="text-green-400">Tusen takk!</AlertTitle>
                <AlertDescription>
                    Vi har mottatt informasjonen din. Vi tar kontakt med deg 24 timer før neste økt starter.
                </AlertDescription>
            </Alert>
        }

      <form className="my-8 " onSubmit={handleSubmit}>
        {/* email field */}
        <LabelInputContainer>
          <Label htmlFor="email">Din epost *</Label>
          <Input
            id="email"
            placeholder="navn@eksempel.no"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(errorMessage ? "border-red-500" : "")}
          />
        </LabelInputContainer>

        {/* phone field */}
        <LabelInputContainer>
          <Label htmlFor="phone">Telefonnummer *</Label>
          <Input
            id="phone"
            placeholder="12345678"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
