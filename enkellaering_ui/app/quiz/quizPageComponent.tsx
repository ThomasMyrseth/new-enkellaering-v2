
"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { FocusCards } from "@/components/ui/focus-cards"
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp"
import { useQuizzes } from "@/hooks/use-quizzes"
import { Skeleton } from "@/components/ui/skeleton"


export function QuizPageComponent({description} : {description?: string}) {
    const router = useRouter()

    const [quizzes, loading, error] = useQuizzes()

    if (error) console.error("Error fetching quizzes: " + error);

   const handleSetSelectedQuiz =(quizId :string) => {
        router.push(`/quiz/${quizId}`)
   }


   const cards = quizzes.map((quiz) => ({
        title: quiz.title,
        src: quiz.image_url || "/enkel_laering_transparent.png",
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
            {loading ? (
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            ) : (
                <FocusCards cards={cards}/>
            )}
        </div>
    </div>)
}