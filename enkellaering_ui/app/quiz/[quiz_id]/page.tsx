"use client"
import React from "react"
import { useState, useEffect } from "react"
import { FullQuizType, QuestionType } from "../types"
import Quiz from "../quiz"
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton"

export default function QuizPage() {
    const [token, setToken] = useState<string>("no-token-found"); // Default value
    const baseUrl :string= process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
    const params = useParams();
    const quiz_id = params?.quiz_id as string; 
    const [quiz, setQuiz] = useState<QuestionType[]>([])
    const [quizMetaData, setQuizMetaData] = useState<FullQuizType | null>(null)


    //fetch token
    useEffect(() => {
        const storedToken = localStorage.getItem("token") || "no-token-found";
        setToken(storedToken);
    }, []);


    //fetch the quiz
    useEffect(() => {

        if (!quiz_id || token === "no-token-found") return;

        async function fetchQuiz() {
            const res = await fetch(`${baseUrl}/get-quiz`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                method: "POST",
                body: JSON.stringify({
                    quiz_id: quiz_id
                })
            })

            if (res.ok) {
                const data = await res.json()
                setQuiz(data.quiz)
            }
        }

        async function fetchQuizMetaData() {
            const res = await fetch(`${baseUrl}/get-quiz-meta-data`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                method: "POST",
                body: JSON.stringify({
                    quiz_id: quiz_id
                })
            })

            if (res.ok) {
                const data = await res.json()
                setQuizMetaData(data.quizzes)
            }
        }

        fetchQuizMetaData()
        fetchQuiz()
    },[token, baseUrl])

    if (!quiz || !quizMetaData) return (<Skeleton/>)


    return(<>
        <Quiz 
            questions={quiz}
            passThreshold={quizMetaData.pass_threshold}            
            quizId={quizMetaData.quiz_id}
            title={quizMetaData.title}
            baseUrl={baseUrl}
            token={token}
        />
    </>)
}