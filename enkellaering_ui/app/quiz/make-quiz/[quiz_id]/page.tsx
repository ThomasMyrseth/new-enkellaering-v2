"use client"
import { useState } from "react"
import { useParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

import { MakeQuizForm } from "./newQuestionForm"
import { CountQuestions } from "./countQuestions";
import { QuestionWithFileType } from "../../types"
import { SaveQuiz } from "./saveQuiz";


export default function MakeQuizPage() {

    const [questions, setQuestion] = useState<QuestionWithFileType[]>([])
    const { quiz_id } = useParams() as { quiz_id: string };


    const handleAddQuestion = (file :File, timelimit :number, question :string, options :string[], correct : 0|1|2|3) => {
        const uniqueId = uuidv4();

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