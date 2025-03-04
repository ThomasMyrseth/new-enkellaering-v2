"use client"
import { QuestionType, QuizType, FullQuizType } from "@/app/quiz/types"
import { useState, useEffect } from "react"
import { MakeQuizForm } from "./makeQuiz"

const Quiz = () => {
    const [questions, setQuestions] = useState<QuestionType[]>()    
    const [quiz, setQuiz] = useState<QuizType>()

    return(<>
        <MakeQuizForm/>
    </>)
}


export default Quiz