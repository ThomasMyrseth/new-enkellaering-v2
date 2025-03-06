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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"



export function MakeQuizForm( {onGoToNextQuestion} : {onGoToNextQuestion: (file: File, timelimit :number, question: string, options: string[], correctOption: 0|1|2|3) => boolean}) {

    const [file, setFile] = useState<File | null>(null);
    const [question, setQuestion] = useState<string>("");
    const [options, setOptions] = useState<string[]>(["Alternativ 1", "Alternativ 2", "Alternativ 3", "Alternativ 4"])
    const [correctOption, setCorrectOption] = useState<0|1|2|3>(0)
    const [timelimit, setTimelimit] = useState<number>(30)
    const [success, setSuccess] = useState<boolean>()


    const handleFileUpload = (files: File[]) => {
      setFile(files[0]);
    };

    const handleSetQuestion = (value :string) => {
        setQuestion(value)
    }

    const handleSetTimelimit = (value: number) => {
        setTimelimit(value)
    }


    const handleOptionChange = (value: string, index :number) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };
    

    const handleButtonClick = () => {
        if (!file || !timelimit || !question || !options || correctOption === undefined) {
            console.log("missing fields")
            setSuccess(false)
            return
        }
        const response = onGoToNextQuestion(file, timelimit, question, options, correctOption)
        if (!response) {
            console.log("error from parent component")
            setSuccess(false)
            return
        }
        //clear all the fields and move on to next question
        setQuestion("")
        setOptions(["", "", "", ""]);
        setCorrectOption(0)
        setTimelimit(30)
        setSuccess(true)
    }


  return (<>
  
    <div className=" w-4/5  mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">

    {success===false && <>
            <p className="text-red-500">Fyll ut alle felter</p>
        </>
    }
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="firstname">Spørsmål</Label>
            <Textarea
                rows={2}
                value={question}
                onChange={(e) => handleSetQuestion(e.target.value)}
            />
          </LabelInputContainer>
        </div>

        <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
            <FileUpload onChange={handleFileUpload} title="Bilde"/>
        </div>

        <Label htmlFor="option">Svaralternativer</Label>
        <div className="flex flex-col space-y-2 md:space-y-0 md:space-x-2 mb-4">
        <RadioGroup
            defaultValue="0"
            value={correctOption.toString()}
            onValueChange={(value: string) =>
                setCorrectOption(parseInt(value) as 0 | 1 | 2 | 3)
            }
        >
         <LabelInputContainer className="flex flex-row items-center space-x-4">
            <RadioGroupItem value="0"/>
            <Input
                value={options[0]}
                onChange={(e) => handleOptionChange(e.target.value, 0)}
                placeholder="Alternativ 1"
                />
          </LabelInputContainer>

          <LabelInputContainer className="flex flex-row items-center space-x-4">
            <RadioGroupItem value="1"/>
            <Input
                value={options[1]}
                onChange={(e) => handleOptionChange(e.target.value, 1)}
                placeholder="Alternativ 2"
                />
          </LabelInputContainer>

          <LabelInputContainer className="flex flex-row items-center space-x-4">
            <RadioGroupItem value="2"/>
            <Input
                value={options[2]}
                onChange={(e) => handleOptionChange(e.target.value, 2)}
                placeholder="Alternativ 3"
                />
          </LabelInputContainer>

          <LabelInputContainer className="flex flex-row items-center space-x-4">
            <RadioGroupItem value="3"/>
            <Input
                value={options[3]}
                onChange={(e) => handleOptionChange(e.target.value, 3)}
                placeholder="Alternativ 4"
                />
          </LabelInputContainer>
        </RadioGroup>
        </div>

        
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="firstname">Tidsgrense (sekunder)</Label>
            <Input value={timelimit} onChange={(e) => handleSetTimelimit(parseInt(e.target.value))} type="number" step={10} min={30} max={600}/>
          </LabelInputContainer>
        </div>

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
          onClick={handleButtonClick}
        >
            Neste
          <BottomGradient />
        </button>
    </div>
  </>);
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
