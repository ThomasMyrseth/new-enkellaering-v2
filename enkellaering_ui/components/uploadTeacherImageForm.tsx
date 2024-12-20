"use client";
import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/moving-border";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

import { Terminal } from "lucide-react"
 
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
 
const BASEURL = process.env.NEXT_PUBLIC_BASE_URL;

export const FileUploadForm = ({firstname, lastname} : {firstname :string, lastname: string}) => {
    const pathname = usePathname(); // Get the current pathname
    const segments = pathname.split('/'); // Split the pathname into segments
    const userId :string= segments[2].toString(); // Extract the 'user_id' from the correct position
    const [files, setFiles] = useState<File[]>([]);
    const [aboutMe, setAboutMe] = useState<string>('')
    const [fileError, setFileError] = useState<boolean | null>(null)
    const [aboutMeError, setAboutMeError] = useState<boolean | null>(null)
    const [success, setSuccess] = useState<boolean | null>(null)


    const handleFileUpload = (files: File[]) => {
        setFiles(files);
    };
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
      
        if (!files.length) {
          setFileError(true);
          return;
        }
        if (!aboutMe) {
          setAboutMeError(true);
          return;
        }
      
        const formData = new FormData();
        formData.append("user_id", userId);
        formData.append("about_me", aboutMe);
        formData.append("file", files[0]); // Add the first file
        formData.append("firstname", firstname)
        formData.append("lastname", lastname)
      
        try {
          const response = await fetch(`${BASEURL}/upload-teacher-image`, {
            method: "POST",
            credentials: "include",
            body: formData, // Use FormData directly
          });
      
          if (!response.ok) {
            setSuccess(false);
          } else {
            setSuccess(true);
            setFiles([]);
            setAboutMe("");
          }
        } catch (error) {
          console.error("Error uploading file:", error);
          setSuccess(false);
        }
      };

  return (
    <div className="w-3/4 mx-auto min-h-96 bg-white dark:bg-black  rounded-lg">

        {fileError && (
            <Alert className="text-red-400">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                    Ser ut til at du ikke har lastet opp bilde
                </AlertDescription>
            </Alert>
        )}
        {aboutMeError && (
            <Alert className="text-red-400">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                    Ser ut til at du ikke har skrevet noe om deg selv
                </AlertDescription>
            </Alert>
        )}
        {success && (
              <Alert className="text-green-400">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Nydelig!</AlertTitle>
              <AlertDescription>
                  Bilde og tekst om deg er lastet opp!
              </AlertDescription>
          </Alert>
        )}
        {!success && (
              <Alert className="text-red-400">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Ojda</AlertTitle>
              <AlertDescription>
                  Det skjedde en feil under opplastningen av bilde og tekst
              </AlertDescription>
          </Alert>
        )}

        <form className="m-8 flex flex-col space-y-10 items-center justify-center" onSubmit={handleSubmit}>
            <h2 className="font-bold text-xl">Last opp en kort beskrivelse av deg som skal vises frem på nettsiden</h2>
            <FileUpload onChange={handleFileUpload} />
            <Textarea 
                rows={10}
                placeholder="Skriv litt om deg selv og hvordan du underviser"
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
            />

            <button className="relative width inline-flex h-12 overflow-hidden rounded-full p-[5px] dark:p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                    Send inn
                </span>
            </button>
      </form>

    </div>
  );
}