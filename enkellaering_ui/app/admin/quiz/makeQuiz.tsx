"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider"
import { FileUpload } from "@/components/ui/file-upload";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";



export function MakeQuizForm() {
    const BASEURL :string = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
    const token :string | null = localStorage.getItem('token') || null
    const router = useRouter()

    const [passTreshold, setPassTreshold] = useState<number[]>([80])
    const [files, setFiles] = useState<File[]>([]);
    const [title, setTitle] = useState<string>("");
    const [allValid, setAllValid] = useState<boolean | null>(null)
    const [success, setSuccess] = useState<boolean | null>(null)

    const handleFileUpload = (files: File[]) => {
      setFiles(files);
      console.log(files);
    };

    const handleSetTitle = (value :string) => {
        setTitle(value)
    }


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const valid = validateForm(files, title, passTreshold)
        setAllValid(valid)

        if (!valid) {
            return; //do not submit the quiz
        }

        if (!token) {
            router.push('/login-laerer')
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("pass_treshold", passTreshold[0].toString()); 
        formData.append("image", files[0]); 


        const res = await fetch(`${BASEURL}/upload-quiz`, {
            method: "POST",
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
                //"Content-Type": "application/json",
            },
            body: formData,
        });

        if (!res.ok) {
            setSuccess(false)
            return
        }
        else {

            const data = await res.json();

            if (!data || !data.url) {
                setSuccess(false)
                return
            }
            console.log("redirecting to:", data.url);
            router.push(data.url);
        }
    };



  return (<>
    {success===false && <>
        <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
                En feil skjedde ved opprettingen av quizen
            </AlertDescription>
    </Alert>
    
    </>}
  
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Opprett en ny quiz
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Start med å bestemme fag og tittell, så kan du lage spørsmål
      </p>
      {allValid===false && (<p className="text-red-400">Fyll ut alle feltene</p>)}

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="firstname">Fag tittel</Label>
            <Input 
                id="subject" 
                placeholder="Matte R1" 
                type="text" 
                value={title} 
                onChange={(e) => handleSetTitle(e.target.value)} 
            />
          </LabelInputContainer>
        </div>
        <LabelInputContainer className="mb-4">
            <div className="flex flex-row justify-between">
                <Label>Sett bestått-grensen i prosent</Label>
                <Label>{passTreshold[0]}</Label>
            </div>
            <Slider defaultValue={[33]} onValueChange={setPassTreshold} value={passTreshold} max={100} min={0} step={1} />
        </LabelInputContainer>

        <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
            <FileUpload onChange={handleFileUpload} title="Last opp et forsidebilde til quizzen"/>
        </div>

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
            Opprett
          <BottomGradient />
        </button>

      </form>
    </div>
    </>
  );
}

function validateForm(files :File[]|null, title :string|null, passTreshold :number[]|null) {

    if (!files || files.length!==1) {
        return false
    }

    const file = files[0]
    if (!file || !file.name || !file.type) {
        return false
    }


    if (!title) {
        return false
    }

    if (!passTreshold || !passTreshold[0] || passTreshold[0]<1) {
        return false
    }

    return true
}


const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
