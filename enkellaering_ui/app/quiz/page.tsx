
"use client"

import React from "react"
import { useEffect, useState } from "react"
import { QuizType } from "./types"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function QuizPage() {
    const token :string= localStorage.getItem('token') || 'no-token-found'
    const baseUrl :string= process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
    const router = useRouter()
    
    const [quizzes, setQuizzes] = useState<QuizType[]>([])

    //fetch the quiszes
    useEffect(() => {
        async function fetchQuizzes() {
            const res = await fetch(`${baseUrl}/get-all-quizzes`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                method: "GET",
            })

            if (res.ok) {
                const data = await res.json()
                setQuizzes(data.quizzes)
            }
        }

        fetchQuizzes()
    },[])

   const handleSetSelectedQuiz =(quizId :string) => {
        router.push(`/quiz/${quizId}`)
   }

    //fetch the questions once quiz has been selected
    return (<>
        <h1>Velg hvilken quiz du skal ta. Testen vil starte umidelbart når du trykker på knappen</h1>
        {quizzes.map((quiz, index) => {
            return<Button onClick={() => handleSetSelectedQuiz(quiz.quiz_id)} key={index}>{quiz.title}</Button>
        })}
    </>)
}