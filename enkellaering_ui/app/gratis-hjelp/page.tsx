"use client";
import { send } from 'process';
import React from 'react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function GratisHjelpPage() {
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;

    const [name, setName] = useState<string>('Andreas')
    const [email, setEmail] = useState<string>('andreas@gmail.com')
    const [phone, setPhone] = useState<string>('12345678')    
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<boolean>(false)
    const [disabled, setIsDisabled] = useState<boolean>(false)
    const [numberInQueue, setNumberInQueue] = useState<number | null>(null);
    const [availableFrom, setAvailableFrom] = useState<string | null>(null);
    const [availableTo, setAvai]

    //get number in queue on component mount
    useEffect(() => {
        //fetch number in queue from backend
        const fetchQueueNumber = async () => {
            try {
                const response = await fetch(`${BASEURL}/help-queue/number-in-queue`);
                const data = await response.json();
                setNumberInQueue(data.numberInQueue);
            } catch (error) {
                console.error("Error fetching number in queue:", error);
            }
        };

        fetchQueueNumber();
    }, [BASEURL]);

    //send data to backend or perform any side effects here
    const handleSubmit = async (e: React.FormEvent)  => {
        e.preventDefault();

        setIsDisabled(true);
        const response = await fetch(`${BASEURL}/help-queue/join`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "name": name,
                "email": email,
                "phone": phone
            })
        });

        if (!response.ok) {
            setError("En feil har skjedd. Vennligst prøv igjen!");
            toast.error("En feil har skjedd. Vennligst prøv igjen!");
            setIsDisabled(false)
            setSuccess(false);
        } else {
            setError(null);
            setSuccess(true);
        }
    }

    return (<>
        <div className="max-w-md mx-auto p-4">
        <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-4">Motta gratis hjelp med dine lekser</h1>
            <p className="mb-4">Fyll ut skjemaet under, så får du en epost med en videolenke du kan bli med i. Du vil få hjelp i opptil 10 minutter av en av våre mentorer</p>
            <p>Det er foreløpig</p>
        </div>

        <form className="my-8 " onSubmit={handleSubmit}>
            {/* phone field */}
            <LabelInputContainer>
            <Label htmlFor="name">Ditt navn</Label>
            <Input
                id="name"
                placeholder="Andreas"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            </LabelInputContainer>

            <LabelInputContainer>
            <Label htmlFor="email">Din epost</Label>
            <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            </LabelInputContainer>

            <LabelInputContainer>
            <Label htmlFor="phone">Ditt telefonnummer</Label>
            <Input
                id="phone"
                placeholder="12345678"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
            </LabelInputContainer>
            
            <Button type="submit" variant="default" disabled={disabled} className="w-full h-10">
            Send inn
            </Button>
            
        </form>
        </div>
    </>);
}

const LabelInputContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};
    
    
    