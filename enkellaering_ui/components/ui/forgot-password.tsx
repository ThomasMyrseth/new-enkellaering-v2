"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/app/auth/firebase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "./button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(`Epost med ny lenke er sendt til ${email}`);
      toast.success('Vi har sendt deg en epost med instruksjoner for å tilbakestille passordet ditt.');
    } catch (err: unknown) {
      toast.error('Noe gikk galt ved tilbakestilling av passord. Vennligst prøv igjen.');
      setErrorMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-none m-4 bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">Glemt Passord</h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Fyll inn e-postadressen din for å få en lenke til å tilbakestille passordet
      </p>

      {message && <p className="text-green-500 text-sm my-4">{message}</p>}
      {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

      <form className="my-8" onSubmit={handleReset}>
        {/* Email Field */}
        <LabelInputContainer>
          <Label htmlFor="email">E-post</Label>
          <Input
            id="email"
            placeholder="anne@fra.landet"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={cn(errorMessage ? "border-red-500" : "")}
          />
        </LabelInputContainer>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-8"
        >
          {loading ? "Sender..." : "Send tilbakestillingslenke"}
        </Button>
      </form>

      <Link href={'/login'} className="text-sm text-neutral-600 dark:text-neutral-400 hover:underline">
        Tilbake til innlogging
      </Link>
    </div>
  );
}

const LabelInputContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};