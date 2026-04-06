"use client";
import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[100vw] py-4 px-4 md:px-6 lg:px-8 m-0 lg:py-10 min-h-screen space-y-10">
      
      {/* Header Container */}
      <div className="h-[15rem] sm:h-[20rem] sm:w-3/4 bg-white dark:bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-black dark:text-white relative z-20">
          <span className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
            Personvernerklæring
          </span>
        </h1>
        <div className="w-full max-w-[40rem] h-10 sm:h-20 relative mt-4">
          <div className="absolute inset-x-5 sm:inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
          <div className="absolute inset-x-5 sm:inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
          <div className="absolute inset-x-10 sm:inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
          <div className="absolute inset-x-10 sm:inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />
        </div>
      </div>

      {/* Content Container */}
      <div className="bg-fuchsia-100 dark:bg-neutral-900 rounded-lg w-full lg:w-3/4 p-6 md:p-8 lg:p-12 space-y-8 text-neutral-800 dark:text-neutral-200 shadow-sm text-left">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black dark:text-white">1. Introduksjon</h2>
          <p>
            Enkel Læring tar ditt personvern på alvor. Denne personvernerklæringen forklarer 
            hvordan vi samler inn, bruker, og beskytter dine personopplysninger. Våre tjenester 
            er rettet mot norske kunder, og vi opererer i henhold til norsk lov og GDPR.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black dark:text-white">2. Hvilke opplysninger vi samler inn</h2>
          <p>Når du benytter våre tjenester (enten som elev eller lærer), kan vi samle inn følgende personopplysninger:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Navn og kontaktinformasjon (som e-postadresse og telefonnummer)</li>
            <li>Kontoinformasjon</li>
            <li>Brukeropplysninger og kommunikasjon i plattformen</li>
            <li>Tekniske data (IP-adresse, nettlesertype osv.)</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black dark:text-white">3. Hvordan vi bruker opplysningene</h2>
          <p>Vi bruker opplysningene for å kunne levere vår tjeneste til deg. Dette inkluderer å:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Koble elever og lærere sammen for effektiv undervisning og leksehjelp</li>
            <li>Håndtere brukerkontoer og kundehenvendelser</li>
            <li>Forbedre våre tjenester og nettside</li>
            <li>Sende viktig informasjon vedrørende din brukerkonto og tjenesten</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black dark:text-white">4. Lagring og sikkerhet</h2>
          <p>
            For å sikre at dine data behandles trygt og forsvarlig, bruker vi Supabase som vår databaseleverandør. 
            All data lagres trygt på Supabases servere som er lokalisert i London (Storbritannia). Storbritannia 
            anses å ha et tilstrekkelig beskyttelsesnivå for personopplysninger, i tråd med GDPR, gjennom 
            beslutning om adekvans (adequacy decision) fra EU-kommisjonen.
          </p>
          <p>
            Vi tar sikkerheten på alvor og har iverksatt tiltak for å forhindre tap, misbruk eller uautorisert 
            tilgang til dine opplysninger.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black dark:text-white">5. Dine rettigheter</h2>
          <p>Som registrert bruker har du rett til å:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Be om innsyn i de personopplysningene vi har om deg</li>
            <li>Kreve retting av feilaktig informasjon</li>
            <li>Kreve sletting av dine personopplysninger ("retten til å bli glemt")</li>
            <li>Protestere på behandlingen eller be om begrensning av den</li>
            <li>Be om dataportabilitet der det er relevant</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black dark:text-white">6. Kontakt oss</h2>
          <p>
            Dersom du har spørsmål om denne personvernerklæringen, eller ønsker å utøve dine rettigheter, kan 
            du kontakte oss.
          </p>
        </section>
      </div>

    </div>
  );
}
