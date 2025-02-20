"use client"
import React from "react"
import { useState, useEffect } from "react"
import { FullQuizType } from "../types"
import Quiz from "../quiz"
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton"

export default function QuizPage() {
    const token :string= localStorage.getItem('token') || 'no-token-found'
    const baseUrl :string= process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
    const params = useParams();
    const quizId = params?.quizId as string; // Extract quizId
    const [quiz, setQuiz] = useState<FullQuizType>()

    //fetch the quiz
    useEffect(() => {
        async function fetchQuiz() {
            const res = await fetch(`${baseUrl}/get-quiz`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                method: "POST",
                body: JSON.stringify({
                    quizId: quizId
                })
            })

            if (res.ok) {
                const data = await res.json()
                setQuiz(data.quiz)
            }
        }

        fetchQuiz()
    },[])

    if (!quiz) return (<Skeleton/>)

    return(<>
        <Quiz quizId={quizId} title={quiz.title} questions={quiz.questions} passTreshold={quiz.passTreshold} baseUrl={baseUrl} token={token}/>
    </>)
}