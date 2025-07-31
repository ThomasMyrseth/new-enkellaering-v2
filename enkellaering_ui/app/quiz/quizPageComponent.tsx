
"use client"

import React from "react"
import { useEffect, useState } from "react"
import { QuizType } from "./types"
import { useRouter } from "next/navigation"
import { FocusCards } from "@/components/ui/focus-cards"
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp"


export function QuizPageComponent({description} : {description?: string}) {
    const [token, setToken] = useState<string | null>(null)
    const baseUrl :string= process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080'
    const router = useRouter()
    
    const [quizzes, setQuizzes] = useState<QuizType[]>([])

    //fetch token
    useEffect(() => {
        const token = localStorage.getItem('token')

        if (!token) {
            router.push('/login-laerer')
        }
        setToken(token)
    }, [router])

    //fetch the quiszes
    useEffect(() => {
        async function fetchQuizzes() {
            const res = await fetch(`${baseUrl}/get-all-quizzes`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: "GET",
            })

            if (res.ok) {
                const data = await res.json()
                setQuizzes(data.quizzes)
            }
        }

        fetchQuizzes()
    },[token])

   const handleSetSelectedQuiz =(quizId :string) => {
        router.push(`/quiz/${quizId}`)
   }


   const cards = quizzes.map((quiz: QuizType) => ({
        title: quiz.title,
        src: quiz.image || "/enkel_laering_transparent.png",
        description: "",
        onClick: () => handleSetSelectedQuiz(quiz.quiz_id),
    }));

    //fetch the questions once quiz has been selected
    return (<div className="w-full">
        <LampContainer>
            <motion.h1
                initial={{ opacity: 0.5, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
                }}
                className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
            >
                Velg hvilken test du skal ta
            </motion.h1>
            <motion.p 
             initial={{ opacity: 0.5, y: 100 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{
             delay: 0.3,
             duration: 0.8,
             ease: "easeInOut",
             }}
             className="text-slate-300">
                {description}
             <br/>
                Testen starter så fort du klikker inn på den. Hvert spørsmål er tidsbegrenset.
             </motion.p>
        </LampContainer>
        <div className="w-full mt-4 flex flex-col items-center justify-center">
            <FocusCards cards={cards}/>
        </div>
    </div>)
}