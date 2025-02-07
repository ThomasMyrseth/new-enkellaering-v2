"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../auth/firebase";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


export default function SignupForm() {
  const [validParentPhone, setValidParentPhone] = useState(true);
  const [validStudentPhone, setValidStudentPhone] = useState(true);
  const [validPostalCode, setValidPostalCode] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [validPassword, setValidPassword] = useState(true)
  const [hasPhysicalTutouring, setHasPhysicalTutouring] = useState<boolean>(true)
  const [isSendDisabled, setIsSendDisabled] = useState<boolean>(false)

  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  function validateField(value: string, expectedLength: number, setValid: (valid: boolean) => void) {
    const isValid = value.length === expectedLength;
    setValid(isValid);
    return isValid;
  }

  function validatePassword(value: string) {
    const isValid = value.length >= 8;
    setValidPassword(isValid);
    return isValid;
  }

  function validateForm(e: React.FormEvent<HTMLFormElement>) {
    const form = e.target as HTMLFormElement;
    let allValid = true;

    //remove spaces in the fields
    const parent_phone: string = form["parent-phone"].value.replace(/\s+/g, "");
    const student_phone: string = form["student-phone"].value.replace(/\s+/g, "");
    const postal_code: string = form["postal-code"].value.replace(/\s+/g, "");


    // Validate phone and postal code lengths
    allValid = validateField(parent_phone, 8, setValidParentPhone) && allValid;
    allValid = validateField(student_phone, 8, setValidStudentPhone) && allValid;
    allValid = validateField(postal_code, 4, setValidPostalCode) && allValid;
    allValid = validatePassword(form["password"].value)

    // Validate password match
    const password = form["password"].value;
    const repeatPassword = form["repeat-password"].value;
    if (password !== repeatPassword) {
      setPasswordsMatch(false);
      allValid = false;
    } else {
      setPasswordsMatch(true);
    }

    return allValid;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm(e)) return;
    
    setIsSendDisabled(true) //avoid spam by disabling the button uppon first click 
    
    try {
      const form = e.target as HTMLFormElement;
      
      const email = form["parent-email"].value;
      const password = form["password"].value
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("created user in firebase!")

      const idToken = await userCredential.user.getIdToken();
      console.log("Firebase ID Token:", idToken);



      const response = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_token: idToken,
          firstname_parent: form["parent-firstname"].value,
          lastname_parent: form["parent-lastname"].value,
          email_parent: form["parent-email"].value.replace(/\s+/g, ""),
          phone_parent: form["parent-phone"].value.replace(/\s+/g, ""),
          firstname_student: form["student-firstname"].value,
          lastname_student: form["student-lastname"].value,
          phone_student: form["student-phone"].value.replace(/\s+/g, ""),
          address: form["address"].value,
          postal_code: form["postal-code"].value.replace(/\s+/g, ""),
          main_subjects: form["desired-subjects"].value,
          has_physical_tutoring: hasPhysicalTutouring,
          hours_per_week: parseInt(form["hours-per-week"].value),
          additional_comments: form["additional-comments"].value,
        }),
      });

      if (response.ok) {
        response.json().then(data => {
            const userId = data.user_id; // Extract user_id from the response
            const token = data.token

            localStorage.setItem('token', token)
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('user_id', userId);
            localStorage.setItem('role', 'student');
            
            router.push(`/min-side`);
        }).catch(err => {
            console.error("Failed to parse response JSON:", err);
        });
      } else {
        const errorData = await response.json();
        alert(`Signup failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleSetPhysical = (value :string) => {
    const physical :boolean = value === "Fysisk"
    setHasPhysicalTutouring(physical)
  }
  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">Velkommen til Enkel Læring</h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Fyll ut feltene under for å opprette en konto
      </p>

      <form className="my-8" onSubmit={handleSubmit}>

        {/* Parent Information */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="parent-firstname">Fornavn til forelder</Label>
            <Input id="parent-firstname" placeholder="Anne" type="text" />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="parent-lastname">Etternavn til forelder</Label>
            <Input id="parent-lastname" placeholder="fra landet" type="text" />
          </LabelInputContainer>
        </div>
        <LabelInputContainer>
          <Label htmlFor="parent-email">Foreldes epost</Label>
          <Input id="parent-email" placeholder="anne@fra.landet" type="email" />
        </LabelInputContainer>
        <LabelInputContainer>
          <Label htmlFor="parent-phone">Foreldes telefon</Label>
          <Input id="parent-phone" placeholder="12345678" type="tel" className={cn(validParentPhone ? "" : "border-red-500")} />
          {!validParentPhone && <p className="text-red-500 text-sm">Telefonnummer må være 8 siffer</p>}
        </LabelInputContainer>

        <br/>

        {/* Student Information */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="student-firstname">Fornavn til elev</Label>
            <Input id="student-firstname" placeholder="Thomas" type="text" />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="student-lastname">Etternavn til elev</Label>
            <Input id="student-lastname" placeholder="fra landet" type="text" />
          </LabelInputContainer>
        </div>
        <LabelInputContainer>
          <Label htmlFor="student-phone">Elevens telefon</Label>
          <Input id="student-phone" placeholder="87654321" type="tel" className={cn(validStudentPhone ? "" : "border-red-500")} />
          {!validStudentPhone && <p className="text-red-500 text-sm">Telefonnummer må være 8 siffer</p>}
        </LabelInputContainer>

        <br/>

        {/* Address Information */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <LabelInputContainer>
            <Label htmlFor="address">Hjemmeadresse</Label>
            <Input id="address" placeholder="123 Main St" type="text" />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="postal-code">Postkode</Label>
            <Input id="postal-code" placeholder="0123" type="text" className={cn(validPostalCode ? "" : "border-red-500")} />
            {!validPostalCode && <p className="text-red-500 text-sm">Postkode må være 4 siffer</p>}
          </LabelInputContainer>
        </div>

        <br />

        {/* Subjects and Comments */}
        <LabelInputContainer>
          <Label htmlFor="desired-subjects">Ønskede fag å få undervisning i</Label>
          <Input id="desired-subjects" placeholder="VG1: Matte 1T, engelsk" type="text" />
        </LabelInputContainer>

        <LabelInputContainer>
          <Label>Skal dere ha fysisk eller digital undervisning?</Label>
          <RadioGroup defaultValue="Fysisk" value={hasPhysicalTutouring ? "Fysisk" : "Digital"} onValueChange={handleSetPhysical}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Fysisk" id="fysisk" />
              <Label htmlFor="fysisk">Fysisk</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Digital" id="digital" />
              <Label htmlFor="digital">Digital</Label>
            </div>
          </RadioGroup>
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="hours-per-week">Omtrent hvor mange klokketimer i uken ønsker dere å ha per uke?</Label>
          <Input id="hours-per-week" placeholder="2" type="number" />
        </LabelInputContainer>

        <LabelInputContainer>
          <Label htmlFor="additional-comments">Andre kommentarer</Label>
          <Input id="additional-comments" placeholder="Eleven er allergisk mot pels" type="text" />
        </LabelInputContainer>

        <br />
        
        {/* Password */}
        <LabelInputContainer>
          <Label htmlFor="password">Passord</Label>
          <Input id="password" placeholder="••••••••" type="password" />
        </LabelInputContainer>
        <LabelInputContainer>
          <Label htmlFor="repeat-password">Gjenta passordet</Label>
          <Input id="repeat-password" placeholder="••••••••" type="password" className={cn(passwordsMatch ? "" : "border-red-500")} />
          {!passwordsMatch && <p className="text-red-500 text-sm">Passordene må være like</p>}
          {!validPassword && <p className="text-red-500 text-sm">Passordet må være minst 8 tegn lang</p>}
        </LabelInputContainer>

        <button  type="submit" disabled={isSendDisabled} className="relative inline-flex h-12 overflow-hidden rounded-full p-[5px] dark:p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className={`${isSendDisabled ? "bg-slate-400" :"inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl"}`}>
                Opprett bruker
            </span>
        </button>


      </form>
    </div>
  );

}

const LabelInputContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};