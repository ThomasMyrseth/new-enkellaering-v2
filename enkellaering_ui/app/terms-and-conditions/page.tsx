"use client";
import React from "react";

export default function TermsAndConditionsPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[100vw] py-4 px-4 md:px-6 lg:px-8 m-0 lg:py-10 min-h-screen space-y-10">
      
      {/* Header Container */}
      <div className="h-[15rem] sm:h-[20rem] sm:w-3/4 bg-white dark:bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-center text-black dark:text-white relative z-20">
          <span className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
            Brukervilkår
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
          <h2 className="text-2xl font-semibold text-black dark:text-white">1. Aksept av vilkår</h2>
          <p>
            Ved å registrere deg som bruker eller ta i bruk tjenestene tilhørende Enkel Læring aksepterer 
            du disse brukervilkårene («Vilkårene»). Les nøye gjennom vilkårene før du tar i bruk våre 
            nettsider og tjenester. Er du under 18 år, forutsettes det at du inngår avtale med samtykke av foresatte.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black dark:text-white">2. Beskrivelse av tjenesten</h2>
          <p>
            Enkel Læring tilbyr leksehjelp, veiledning og undervisning for elever og studenter. Tjenestene 
            digitaliseres og organiseres primært via vår plattform der elever kobles opp mot erfarne og dyktige lærere. 
            Detaljer om selve undervisningsopplegget og tilgjengelige fag og nivåer finnes på våre øvrige nettsider.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black dark:text-white">3. Brukerkonto</h2>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Ansvar:</strong> Du er selv ansvarlig for at opplysningene du oppgir ved registrering er korrekte, samt å holde disse oppdatert. Du har ansvar for aktiviteten knyttet til din konto.</li>
            <li><strong>Sikkerhet:</strong> Du forplikter deg til å holde innloggingsdetaljer fortrolige og ikke dele disse med en tredjepart.</li>
            <li><strong>Avslutning:</strong> Vi forbeholder oss retten til å suspendere eller slette brukerkontoer ved brudd på disse vilkårene eller ved mistanke om misbruk.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black dark:text-white">4. Priser og innbetaling</h2>
          <p>
            Alle priser for våre timer og pakker er til enhver tid publisert på vår plattform, og vil bli 
            kommunisert tydelig før noe kjøp. Betaling gjennomføres via en sikker tredjeparts betalingsleverandør. 
            Du har ansvar for å melde fra dersom opplysninger om priser eller trekk skulle fremstå som ukorrekte.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black dark:text-white">5. Avbestilling og refusjon</h2>
          <p>
            Avtaler om undervisningstimer kan endres eller avbestilles i henhold til våre gjeldende tidsfrister for 
            avbestilling (kommunisert i din ordrebekreftelse eller på ditt dashbord). Manglende oppmøte eller skjulte forsinkelser 
            medfører som hovedregel full fakturing av den avtalte timen. Avbestillinger som overholder våre frister vil 
            stå som refunderbare.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black dark:text-white">6. Ansvarsbegrensning</h2>
          <p>
            Enkel Læring fungerer som et bindeledd og leverandør av undervisning. Til tross for at vi jobber aktivt 
            for høy kvalitet, stiller vi ingen garanti for at hver enkelt elev vil oppnå gitte karakterer eller 
            bestemte akademiske resultater. Vi er ikke erstatningsansvarlige for indirekte tap som følge av avbrudd i 
            teknisk tjenestetilbud. All bruk skjer på eget ansvar, og våre tjenester "leveres som den er".
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black dark:text-white">7. Endringer i vilkårene</h2>
          <p>
            Vi forbeholder oss retten til å modifisere disse vilkårene fra tid til annen for å tilpasse 
            oss lover og lovverk eller nye fasetter av våre tjenester. Oppdaterte vilkår vil gjøres 
            tilgjengelig på våre nettsider, og brukere anbefales å se over disse regelmessig.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-black dark:text-white">8. Lovvalg og tvister</h2>
          <p>
            Denne avtalen skal reguleres og tolkes i henhold til norsk lov. Eventuelle tvister skal forsøkes løst 
            i minnelighet. Dersom partene ikke oppnår enighet, vil rett verneting være Oslo Tingrett (eventuelt 
            lokal domstol der Enkel Læring er registrert), med mindre ufravikelig lovgiving stiller andre vilkår 
            for forbrukere.
          </p>
        </section>
      </div>

    </div>
  );
}
