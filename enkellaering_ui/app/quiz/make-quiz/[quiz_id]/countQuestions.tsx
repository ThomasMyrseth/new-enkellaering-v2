"use client"
import { QuestionWithFileType } from "../../types"

export const CountQuestions = ( {questions} : {questions :QuestionWithFileType[]} ) => {

    return(<>
    
    <p>{questions.length} Questions</p>
    </>)
}