"use client"
import { useEffect, useState } from "react"
import { useParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from "next/navigation";

import { MakeQuizForm } from "./newQuestionForm"
import { CountQuestions } from "./countQuestions";
import { QuestionWithFileType } from "../../types"
import { SaveQuiz } from "./saveQuiz";


export default function MakeQuizPage() {
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
    const token = localStorage.getItem('token')
    const router = useRouter()

    const [questions, setQuestion] = useState<QuestionWithFileType[]>([])
    const { quiz_id } = useParams() as { quiz_id: string };

    useEffect(() => {
        async function isUserAdmin() {
          if (!token) {
            console.warn('No token found, redirecting to login.');
            router.push('/login-laerer');
            return;
          }
      
          try {
            const res = await fetch(`${BASEURL}/is-admin`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });
      
            const data = await res.json();
      
            if (!res.ok || !data.is_admin) {
              console.warn('Not an admin user, redirecting to login.');
              router.push('/login-laerer');
            }
          } catch (error) {
            console.error('Error checking admin status:', error);
            router.push('/login-laerer');
          }
        }
      
        isUserAdmin();
      }, [BASEURL, token, router]);


    const handleAddQuestion = (file :File, timelimit :number, question :string, options :string[], correct : 0|1|2|3) => {
        const uniqueId = uuidv4();

        //1. append the new question
        if (!quiz_id || !file || !timelimit || !question || !options || correct === undefined) {
            return false;
        }
        const q :QuestionWithFileType = {
            quiz_id: quiz_id,
            question_id: uniqueId,
            question: question,
            options: options,
            correct_option: correct,
            image: file,
            time_limit: timelimit
        }
        const prevQ :QuestionWithFileType[] = [...questions]
        prevQ.push(q)
        setQuestion(prevQ)
        return true
    }

    return(<div className="w-full flex flex-col space-y-4">
        <CountQuestions questions={questions}/>
        <MakeQuizForm onGoToNextQuestion={handleAddQuestion}/>
        <SaveQuiz questions={questions}/>
    </div>)
}