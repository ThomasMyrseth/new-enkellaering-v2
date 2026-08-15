"use client"
import React from "react"
import { useState, useEffect } from "react"
import Quiz from "../quiz"
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton"
import { useQuiz, useQuizMetaData } from "@/hooks/use-quiz"

export default function QuizPage() {
    const [token, setToken] = useState<string>("no-token-found"); // Default value
    const baseUrl :string= process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
    const params = useParams();
    const quiz_id = params?.quiz_id as string;
    const [quiz, quizLoading] = useQuiz(quiz_id ?? null)
    const [quizMetaData, metaLoading] = useQuizMetaData(quiz_id ?? null)

    //fetch token
    useEffect(() => {
        const storedToken = localStorage.getItem("token") || "no-token-found";
        setToken(storedToken);
    }, []);

    if (quizLoading || metaLoading || !quiz || !quizMetaData) return (<Skeleton/>)


    return(<>
        <Quiz 
            questions={quiz}
            numberOfQuestions={quizMetaData.number_of_questions || 12}
            passThreshold={quizMetaData.pass_threshold}            
            quizId={quiz_id}
            title={quizMetaData.title}
            baseUrl={baseUrl}
            token={token}
        />
    </>)
}