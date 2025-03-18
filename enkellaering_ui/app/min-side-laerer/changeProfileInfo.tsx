"use client"

"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Teacher } from "../admin/types";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export function ProfileForm( {teacher} : {teacher : Teacher}) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // State variables for the profile fields
  const [firstname, setFirstname] = useState<string>(teacher.firstname);
  const [lastname, setLastname] = useState<string>(teacher.lastname);
  const [email, setEmail] = useState<string>(teacher.email);
  const [phone, setPhone] = useState<string>(teacher.phone);
  const [address, setAddress] = useState<string>(teacher.address);
  const [postalCode, setPostalCode] = useState<string>(teacher.postal_code);
  const [additionalComments, setAdditionalComments] = useState<string>(teacher.additional_comments || '');
  const [location, setLocation] = useState<string>(teacher.location);
  const [digitalTutoring, setDigitalTutoring] = useState<boolean>(teacher.digital_tutouring);
  const [physicalTutoring, setPhysicalTutoring] = useState<boolean>(teacher.physical_tutouring);
  const [isSendDisabled, setIsSendDisabled] = useState<boolean>(false);



  // Simple form validation for required fields
  const validateForm = () => {
    if (!firstname.trim() || !lastname.trim() || !email.trim() || !phone.trim()) {
      toast("Fornavn, etternavn, telefon og epost er påkrevd.");
      return false;
    }
    // Validate postal code if provided (expecting 4 digits)
    if (postalCode && postalCode.replace(/\s+/g, "").length !== 4) {
      toast("Postkode må være 4 siffer.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSendDisabled(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/update-teacher-profile`, {
        method: "POST", // Change to POST if your API requires it
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          firstname: firstname,
          lastname: lastname,
          email: email,
          phone: phone.replace(/\s+/g, ""),
          address: address,
          postal_code: postalCode.replace(/\s+/g, ""),
          additional_comments: additionalComments,
          location: location,
          digital_tutoring: digitalTutoring,
          physical_tutoring: physicalTutoring,
        }),
      });
      if (response.ok) {
        toast("Profilen ble oppdatert!");
        // Optionally redirect or update UI here
      } else {
        const errorData = await response.json();
        alert(`Oppdatering mislyktes: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Update profile error:", error);
      alert("En uventet feil oppsto. Vennligst prøv igjen.");
    }
    setIsSendDisabled(false);
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">Endre Profilinformasjon</h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Rediger informasjonen din nedenfor
      </p>
      <form className="my-8" onSubmit={handleSubmit}>
        {/* Name fields */}
        <LabelInputContainer>
          <Label htmlFor="firstname">Fornavn</Label>
          <Input
            id="firstname"
            type="text"
            placeholder="Fornavn"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
        </LabelInputContainer>
        <LabelInputContainer>
          <Label htmlFor="lastname">Etternavn</Label>
          <Input
            id="lastname"
            type="text"
            placeholder="Etternavn"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
        </LabelInputContainer>
        {/* Email */}
        <LabelInputContainer>
          <Label htmlFor="email">Epost</Label>
          <Input
            id="email"
            type="email"
            placeholder="epost@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </LabelInputContainer>
        {/* Phone */}
        <LabelInputContainer>
          <Label htmlFor="phone">Telefon</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="12345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </LabelInputContainer>
        {/* Address and Postal Code */}
        <LabelInputContainer>
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            type="text"
            placeholder="Gateadresse"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </LabelInputContainer>
        <LabelInputContainer>
          <Label htmlFor="postal-code">Postkode</Label>
          <Input
            id="postal-code"
            type="text"
            placeholder="0123"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
        </LabelInputContainer>
        {/* Location */}
        <LabelInputContainer>
          <Label htmlFor="location">Sted (By)</Label>
          <Input
            id="location"
            type="text"
            placeholder="Byen du bor i"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </LabelInputContainer>
        {/* Additional Comments */}
        <LabelInputContainer>
          <Label htmlFor="additional-comments">Andre kommentarer</Label>
          <Input
            id="additional-comments"
            type="text"
            placeholder="Evt. kommentarer"
            value={additionalComments}
            onChange={(e) => setAdditionalComments(e.target.value)}
          />
        </LabelInputContainer>

        {/* Tutoring Options */}
        <div className="mb-4">
          <div className="flex items-center mt-2 space-x-1">
            <Switch checked={digitalTutoring} onCheckedChange={() => setDigitalTutoring(!digitalTutoring)}/>
            <Label>Jeg ønsker flere digitale elever</Label>
          </div>
          <div className="flex items-center mt-2 space-x-1">
            <Switch checked={physicalTutoring} onCheckedChange={() => setPhysicalTutoring(!physicalTutoring)}/>
            <Label>Jeg ønsker flere fysiske elever</Label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSendDisabled}
          className="relative inline-flex h-12 overflow-hidden rounded-full p-[5px] dark:p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
        >
          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span
            className={cn(
              isSendDisabled
                ? "bg-slate-400"
                : "inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl"
            )}
          >
            Oppdater Profil
          </span>
        </button>
      </form>
    </div>
  );
}

const LabelInputContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="mb-4">{children}</div>;
};