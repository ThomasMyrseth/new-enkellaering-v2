"use client";
import { SparklesCore } from "@/components/ui/sparkles";
//import { TeacherFocusCards } from "@/components/ui/teacherCards";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import React from "react";
import { TeacherFocusCards } from "@/components/ui/newTeacherCard";

export default function OmOssPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[100vw] py-4 px-4 md:px-6 lg:px-8 m-0 lg:py-10 min-h-screen space-y-10">
      <SparklesHeadline />
      <div className="space-y-10 flex flex-col items-center justify-center w-full">
        <AboutEl />
        <TeacherFocusCards/>
      </div>
    </div>
  );
}

function SparklesHeadline() {
  return (
    <div className="h-[20rem] sm:h-[30rem] md:h-[40rem]  sm:w-3/4 bg-white dark:bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
      <h1 className="text-6xl md:text-5xl lg:text-7xl font-bold text-center text-black dark:text-white relative z-20">
        <span className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
            Om oss
        </span>
      </h1>
      <div className="w-full max-w-[40rem] h-20 sm:h-40 relative">
        {/* Gradients */}
        <div className="absolute inset-x-5 sm:inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-5 sm:inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-10 sm:inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-10 sm:inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

        {/* Core component */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#4A90E2"
        />

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-white dark:bg-black blur-sm [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </div>
    </div>
  );
}

function AboutTeachers() {
  return (
    <div className="bg-fuchsia-100 dark:bg-black rounded-lg w-full lg:w-3/4 p-4 md:p-6 lg:p-8  space-y-6 flex flex-col items-center justify-center">
      <h1 className="text-3xl md:text-4xl lg:text-5xl text-neutral-800 dark:text-neutral-200 text-center">
        Møt våre{" "}
        <span className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
          helter
        </span>
      </h1>
      <p className="text-center text-base md:text-lg lg:text-xl w-full sm:w-2/3 text-neutral-600 dark:text-neutral-300">
        Lærerne våre er fordelt i Oslo og Trondheim. De aller fleste av oss er
        studenter og jobber på deltid, mange innenfor ingeniør og lektor. <br />
        Les om noen av oss her.
      </p>
      <TeacherFocusCards />
    </div>
  );
}

function AboutEl() {
  const words = `Enkel Læring startet som et innlegg på en nabolagsgruppe på facebook under første bølgen med Corona.
Det var mange barn som trengte hjelp og jeg, Thomas Myrseth, bestemte meg for å hjelpe.
Det ville ta to år før den første ansettelsen og den første nettsiden, men under ett år for å bli fem ansatte.
I dag er vi en robust gjeng på omtrent 10 personer og flere år med erfaringer i beltet.
Alle nye ansatte går gjennom grundig undervisning der de blir tipset om hva som kan være lurt å prøve, og hvilke feller man burde holde seg unna.`;

  return (
    <div className="bg-fuchsia-100 dark:bg-black rounded-lg w-full lg:w-3/4 p-4 md:p-6 lg:p-8 space-y-6 flex flex-col items-center justify-center">
      <TextGenerateEffect words={words} />
    </div>
  );
}