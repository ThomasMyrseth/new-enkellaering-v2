"use client"
import { DeleteQuiz } from "./deleteQuizzes"
import { MakeQuizForm } from "./makeQuiz"

const Quiz = () => {

    return(<>
        <MakeQuizForm/>
        <DeleteQuiz />
    </>)
}


export default Quiz