"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../auth/firebase";
import { cn } from "@/lib/utils";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      // Authenticate the user with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", userCredential.user);

      // Get the Firebase ID token
      const idToken = await userCredential.user.getIdToken();

      // Send the token to the backend for further validation
      const response = await fetch(`${BASE_URL}/login-teacher`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_token: idToken }),
      });

      if (response.ok) {
        console.log("pushing to /min-side-laerer")
        router.push('/min-side-laerer')
      } else {
        const errorData = await response.json();
        setErrorMessage(`Login failed: ${errorData.error}`);
      }
    } catch (error: unknown) {

      if (error instanceof Error) {
        console.error("Login error:", error);
        setErrorMessage(error.message || "An unexpected error occurred.");
      }
      else {
        console.error("Login error:", error);
        setErrorMessage("An unexpected error occurred.");
      }
    }
  };
  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">Logg Inn Lærer</h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Fyll ut feltene under for å logge inn
      </p>

      {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

      <form className="my-8" onSubmit={handleSubmit}>
        {/* Email Field */}
        <LabelInputContainer>
          <Label htmlFor="email">E-post</Label>
          <Input
            id="email"
            placeholder="anne@fra.landet"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(errorMessage ? "border-red-500" : "")}
          />
        </LabelInputContainer>

        {/* Password Field */}
        <LabelInputContainer>
          <Label htmlFor="password">Passord</Label>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(errorMessage ? "border-red-500" : "")}
          />
        </LabelInputContainer>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-gradient-to-br from-black to-gray-800 text-white w-full py-2 rounded-md mt-4"
        >
          Logg inn
        </button>
      </form>
    </div>
  );
}

const LabelInputContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};