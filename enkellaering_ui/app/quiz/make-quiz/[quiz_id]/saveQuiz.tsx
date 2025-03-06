"use client"
import { useState } from "react";
import { QuestionWithFileType } from "../../types"
import { toast } from "sonner"

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";

export const SaveQuiz = ( {questions} : {questions : QuestionWithFileType[]}) => {
    const [success, setSuccess] = useState<boolean | null>(null)
    const [valid, setValid] = useState<boolean | null>(null)

    const handleButtonClick = () => {
        const valid :boolean = validateQuestions(questions)

        if (!valid) {
            setValid(false)
            return
        }

        try{
            saveToDB( { questions })
        }
        catch(error){
            setSuccess(false)
        }


    }

    return (<>
        {success===false && 
            <AlertDialog>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Failed to save the questions</AlertDialogTitle>
                <AlertDialogDescription>
                  The quiz was not saved, all data has been lost. Please try again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Ok</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }

        {valid===false && 
            <AlertDialog>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>The questions are not valid</AlertDialogTitle>
                <AlertDialogDescription>
                  Please try making the quiz again
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Ok</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }

        <Button onClick={() => handleButtonClick()}>
            Lagre
        </Button>
    
    </>)
}


const saveToDB = async ({ questions }: { questions: QuestionWithFileType[] }) => {
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
    const token = localStorage.getItem('token');
  
    const formData = new FormData();
  
    // Append questions data as JSON string (without the File objects)
    const questionsData = questions.map(q => ({
      ...q,
      image: null // Remove the file for now
    }));
    formData.append('questions', JSON.stringify(questionsData));
    
    // Append files separately with unique keys
    questions.forEach((q, index) => {
      if (q.image) {
        formData.append(`image_${index}`, q.image);
      }
    });

  try {
    const res = await fetch(`${BASEURL}/upload-questions`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
        // Do not set 'Content-Type'; let the browser set it for FormData
      },
      body: formData
    });
  
    if (!res.ok) {
      throw new Error('Failed to save questions');
    }
  
    const data = await res.json();
    toast('Questions saved successfully');
    return data;
  } 
  catch (error) {
    console.error('Error saving questions:', error);
    throw new Error('Failed to save the questions');
  }
};


function validateQuestions(questions : QuestionWithFileType[]) {
    return true;
}