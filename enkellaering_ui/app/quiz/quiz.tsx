"use client"
import React from "react";
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { QuestionType } from "./types";
import Image from 'next/image'
import { TreePalm } from "lucide-react";
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation";


const Question = ({question, questionNumber, options, correctOption, image, timeLimit, onSubmitAnswer} : {question :string, questionNumber :number, options: string[], correctOption: number, image :string | null, timeLimit :number, onSubmitAnswer: (correct: boolean) => void}) => {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(timeLimit);

    const handleGoToNextQuestion = () => {onSubmitAnswer(selectedOption === correctOption)}

    // Automatically move to the next question when the timer runs out
    useEffect(() => {
        if (timeLeft <= 0) {
            handleGoToNextQuestion();
            return;
        }

        const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);

        return () => clearTimeout(timer); // Cleanup timer when component unmounts or re-renders
    }, [timeLeft]);

    return (<>
        <h1>{questionNumber}. {question}</h1>

        {image && 
            <Image
                src={image}
                alt="Quiz image"
                width={500}
                height={300}
            />
        }
        <RadioGroup onValueChange={(value) => setSelectedOption(Number(value))} className="mt-4">
            {options.map((option, index) => {
                return (<div className="flex items-center space-x-2" key={index}>
                    <RadioGroupItem value={option} id={option} />
                </div>)
            })}
        </RadioGroup>

        <Progress value={timeLeft} max={timeLimit}/>
        <Button onClick={() => handleGoToNextQuestion()}>
            Neste <ChevronRight/>
        </Button>


    </>)
}



const Quiz = ({quizId, title, questions, passTreshold, baseUrl, token} : {quizId :string,title :string, questions :QuestionType[], passTreshold :number, baseUrl :string, token :string}) => {
    let numberOfCorrects :number =0;
    let numberOfQuestionsCompleted :number =0;
    let passed :boolean = false;
    let hasSubmitted :boolean = false;
    const [currentQuestion, setCurrentQuestion] = useState<number>(0);
    const router = useRouter()

    //randomly reshufle the order of the questions
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

    const incrementCorrectAnswer = (correct :boolean) => {
        if(correct){
            numberOfCorrects++;
        }
        numberOfQuestionsCompleted++;
        setCurrentQuestion(currentQuestion + 1);
    }

    const handleSubmit = async () => {
        if(numberOfCorrects / numberOfQuestionsCompleted >= passTreshold){
            passed = true;
        }
        hasSubmitted = true;

        const res = await fetch(`${baseUrl}/submit-quiz`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            method: 'POST',
            body: JSON.stringify({
                numberOfCorrects: numberOfCorrects,
                numberOfQuestions: numberOfQuestionsCompleted,
                passed: passed,
                quizId: quizId
            })
        })

        if (!res.ok) {
            alert('En feil har skjedd, venligs prøv igjen')
            return;
        }

        router.push('/min-side-laerer')
    }
    return(<>
        <h1>{title}</h1>
        {
            shuffledQuestions.map((question, index) => {
                return (<Question 
                    question={question.question}
                    questionNumber={index + 1}
                    options={question.options}
                    correctOption={question.correctOption}
                    image={question.image}
                    onSubmitAnswer={incrementCorrectAnswer} 
                    timeLimit={question.timeLimit}
                    key={index}/>)
            })
        }
        {numberOfQuestionsCompleted === shuffledQuestions.length &&
             <Button onClick={handleSubmit}>Submit <TreePalm/></Button>
        }
        {hasSubmitted && passed &&
            <h3 className="text-green-400">Gratulerer! Du bestod</h3>
        }
        {hasSubmitted && !passed &&
            <h3 className="text-red-400">Beklager, du bestod ikke.</h3>
        }
    </>)
}

export default Quiz;