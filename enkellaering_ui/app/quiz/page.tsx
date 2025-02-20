
import React from "react"
import { useEffect, useState } from "react"
import { QuizType } from "./types"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function QuizPage() {
    const token :string= localStorage.getItem('token') || 'no-token-found'
    const baseUrl :string= process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
    const router = useRouter()
    
    const [quizes, setQuizes] = useState<QuizType[]>([])

    //fetch the quizes
    useEffect(() => {
        async function fetchQuizes() {
            const res = await fetch(`${baseUrl}/get-all-quizes`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                method: "GET",
            })

            if (res.ok) {
                const data = await res.json()
                setQuizes(data.quizes)
            }
        }

        fetchQuizes()
    },[])

   const handleSetSelectedQuiz =(quizId :string) => {
        router.push(`/quiz/${quizId}`)
   }

    //fetch the questions once quiz has been selected
    return (<>
        <h1>Velg hvilken quiz du skal ta. Testen vil starte umidelbart når du trykker på knappen</h1>
        {quizes.map((quiz, index) => {
            <Button onClick={() => handleSetSelectedQuiz(quiz.quizId)} key={index}>{quiz.title}</Button>
        })}
    </>)
}