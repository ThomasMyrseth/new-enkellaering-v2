"use client"
import { useState, useEffect, useId } from "react"
import { useParams } from 'next/navigation';

import { MakeQuizForm } from "./newQuestionForm"
import { CountQuestions } from "./countQuestions";
import { QuestionWithFileType } from "../../types"


export default function MakeQuizPage() {

    const [questions, setQuestion] = useState<QuestionWithFileType[]>([])
    const { quiz_id } = useParams() as { quiz_id: string };
    const question_id: string = useId(); // Move it to the top


    const handleAddQuestion = (file :File, timelimit :number, question :string, options :string[], correct : 0|1|2|3) => {

        console.log("quizId: ", quiz_id)
        console.log("file: ", file)
        console.log("timelimit: ", timelimit)
        console.log("question: ", question)
        console.log("options: ", options)
        console.log("correct: ", correct)

        //1. append the new question
        if (!quiz_id || !file || !timelimit || !question || !options || correct === undefined) {
            return false;
        }
        const q :QuestionWithFileType = {
            quiz_id: quiz_id,
            question_id: question_id,
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

    return(<>
        <CountQuestions questions={questions}/>
        <MakeQuizForm onGoToNextQuestion={handleAddQuestion}/>
    </>)
}