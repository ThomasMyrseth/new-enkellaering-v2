"use client"

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

const JobDescription = () => {
  return (
    <div className="space-y-4">
      <div className="bg-neutral-50 dark:bg-neutral-900 border p-4 rounded-lg">
        <Image
          src="/serious_woman.jpg"
          alt="Mentor"
          width={400}
          height={400}
          className="mx-auto mb-4 rounded-lg shadow-lg"
        />
        <p className="rounded-lg p-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-purple-400">
          Enkel Læring er en studentdrevet virksomhet som tilbyr privatundervisning for elever i grunnskolen (1.–10. trinn) og på videregående. All undervisning foregår på kveldstid etter ordinær skoletid.
        </p>

        <p className="bg-gradient-to-br rounded-lg p-4 bg-clip-text text-transparent from-blue-900 to-purple-400">
          <h3 className="text-xl "><strong>Hva gjør en mentor?</strong></h3>
            Som mentor får du ansvar for en liten gruppe elever som du følger gjennom ett eller flere skoleår. Vanligvis har hver mentor 3–6 elever, og du møter én elev av gangen omtrent én gang i uken. En typisk økt består av
            arbeid med eksamens­oppgaver,
            faglige diskusjoner og
            småprat – fordi vi tror læring skjer best når dere trives sammen.
            Målet er at du blir både en faglig støtte <strong>og</strong> en god venn for elevene dine.
        </p>

        <ul className="bg-gradient-to-br ounded-lg p-4 bg-clip-text text-transparent from-blue-900 to-purple-400">
          <h2 className="text-xl"><strong>Hvem ser vi etter?</strong></h2>
          <li className=""><strong>Utadvendt og sosial</strong> – du liker å bli kjent med nye mennesker.</li>
          <li className=""><strong>Faglig trygg</strong> – komfortabel med å svare på spørsmål på sparket.</li>
          <li className=""><strong>God formidler</strong> – klar, tydelig og engasjerende i forklaringene dine.</li>
        </ul>
        <p className="bg-gradient-to-br  rounded-lg p-4 bg-clip-text text-transparent from-blue-900 to-purple-400">
          Er du usikker fordi det er lenge siden du hadde fagene, eller fordi du mangler undervisningserfaring? Slapp av! Alle nye mentorer får et grundig opplærings­program som både friske opp fagkunnskapen og gir deg verktøyene du trenger i klasserommet.
        </p>

        <p className="bg-gradient-to-br rounded-lg p-4 bg-clip-text text-transparent from-blue-900 to-purple-400">
          <h3 className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-purple-400"><strong>Arbeidstid & lønn</strong></h3>
          Arbeidstiden er fleksibel. Vi anbefaler minimum tre elever per mentor – omtrent seks timer i uken. Det finnes ingen øvre grense, men husk: Det er mer i livet enn bare jobb!
          <br/><br/>
          Og lønn? Opp til 335kr/time ;D
        </p>

        <p className="bg-gradient-to-br rounded-lg p-4 bg-clip-text text-transparent from-blue-900 to-purple-400">
          <h3 className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-purple-400"><strong>Klar for å søke?</strong></h3>
          Last opp CV-en din via lenken nedenfor – <strong>søknadsbrev er ikke nødvendig</strong>. Vi gleder oss til å høre fra deg!
        </p>
      </div>
    </div>
  );
}

export default function JobPage() {
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const [files, setFiles] = useState<File[]>([]);
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [grades, setGrades] = useState("");
    const [subject, setSubject] = useState("");
    const [phone, setPhone] = useState("");
    const [isDisabled, setIsDisabled] = useState<boolean>(false);

    const handleFileUpload = (files: File[]) => {
        setFiles(files);
    };

    if (files.length > 0 && files[0].type !== "application/pdf") {
        alert("Kun PDF-filer er tillatt.");
        setFiles([]); // Clear the files if the type is not PDF
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsDisabled(true);

      if (!firstname || !lastname || !email || !phone || !subject || !grades || files.length === 0) {
            alert("Vennligst fyll ut alle feltene og last opp din CV.");
            setIsDisabled(false);
            return;
      }
      const formData = new FormData();
      formData.append("firstname", firstname);
      formData.append("lastname", lastname);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("subject", subject);
      formData.append("grades", grades);
      if (files.length > 0) {
        formData.append("resume", files[0]);
      }
      try {
        console.log("sending formdata to server url: ", `${BASEURL}/upload-job-application`);
        const res = await fetch(`${BASEURL}/upload-job-application`, { method: "POST", body: formData });
        if (!res.ok) {
            alert("Det oppstod en feil ved innsending. Prøv igjen");
            setIsDisabled(false);
            return;
        }
        toast("Tusen takk! Vi har mottatt din søknad.")
        setFirstname("");
        setLastname("");
        setEmail("");
        setPhone("");
        setSubject("");
        setGrades("");
        setFiles([]);
      } catch (error) {
        console.error(error);
        alert("Det oppstod en nettverksfeil.");
      }
        setIsDisabled(false);
    };

  return (
    <div className="grid md:grid-cols-2 grid-cols-1 justify-center items-center w-full mx-auto bg-white dark:bg-black rounded-lg">
        

        <div className="max-w-xl p-4 h-full">
          <JobDescription/>
        </div>

        <form onSubmit={handleSubmit} className="p-4 rounded-lg h-full">
            <div className="shadow-input mx-auto w-full max-w-xl m-4 bg-neutral-50 p-4 md:rounded-2xl md:p-8 dark:bg-neutral-900">
                <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                    Velkommen til Enkel Læring
                </h2>
                <p className="my-4 text-sm text-neutral-600 dark:text-neutral-300">
                    Last opp din CV, samt fyll ut feltene under. Vi kontakter deg snarlig.
                    <br/><br/>Dersom du har spørsmål, send oss en epost på <a href="mailto:kontakt@enkellaering.no" className="text-blue-600 dark:text-blue-400 hover:underline">kontakt@enkellaering.no</a>.
                </p>

                    <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                    <LabelInputContainer>
                        <Label htmlFor="firstname">Fornavn</Label>
                        <Input id="firstname" placeholder="Anita" type="text" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
                    </LabelInputContainer>
                    <LabelInputContainer>
                        <Label htmlFor="lastname">Etternavn</Label>
                        <Input
                          id="lastname"
                          placeholder="Andreasen"
                          type="text"
                          value={lastname}
                          onChange={(e) => setLastname(e.target.value)}
                        />
                    </LabelInputContainer>
                    </div>
                    <LabelInputContainer className="mb-4">
                    <Label htmlFor="email">Epost</Label>
                    <Input
                      id="email"
                      placeholder="anita.andreasen@gmail.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                    <Label htmlFor="grades">Karaktersnitt (fyll ut det du har)</Label>
                    <Input
                      id="grades"
                      placeholder="Vgs: 5.5, universitet: 4.3"
                      type="text"
                      value={grades}
                      onChange={(e) => setGrades(e.target.value)}
                    />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="12345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                      <Label htmlFor="subject">Hvilke fag kan du tenke deg å undervise i?</Label>
                      <Input
                        id="subject"
                        placeholder="Matte ungdomskole, 1t, engelsk Vgs"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                      />
                    </LabelInputContainer>
            <FileUpload onChange={handleFileUpload} title="Last opp din CV her" underText="kun PDF"/>
            <button type="submit" disabled={isDisabled===true} className="w-full relative inline-flex h-12 overflow-hidden rounded-full p-[5px] dark:p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className={`${isDisabled ? "bg-slate-400" :"inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl"}`}>
                    Send inn
                </span>
            </button>
            </div>
        </form>
    </div>
  );
}



const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
