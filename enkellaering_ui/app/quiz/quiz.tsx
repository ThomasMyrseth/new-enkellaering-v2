"use client"
import React, { useState, useEffect, useCallback } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { TreePalm } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { QuestionType } from "./types";

interface QuestionProps {
  question: string;
  questionNumber: number;
  options: string[];
  correctOption: number;
  image: string | null;
  timeLimit: number;
  onSubmitAnswer: (correct: boolean) => void;
}

const Question: React.FC<QuestionProps> = ({
  question,
  questionNumber,
  options,
  correctOption,
  image,
  timeLimit,
  onSubmitAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);

  const handleGoToNextQuestion = useCallback((): void => {
    onSubmitAnswer(selectedOption === correctOption);
  }, [selectedOption, correctOption, onSubmitAnswer]);




  useEffect(() => {
    if (timeLeft <= 0) {
      handleGoToNextQuestion();
      return;
    }
    const timer: NodeJS.Timeout = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, handleGoToNextQuestion]);

  return (
    <div className="w-full md:w-2/3 mx-auto p-6 min-h-3/4 bg-neutral-100 dark:bg-black shadow-lg rounded-lg flex flex-col justify-between items-center">
      <div className="flex flex-col items-center space-y-4 w-full">
        <h1 className="text-2xl font-bold text-center">
          {questionNumber}. {question}
        </h1>

        {image && (
          <div className="my-4">
            <Image
              src={image}
              alt="Quiz image"
              width={500}
              height={300}
              className="rounded-md shadow-md"
            />
          </div>
        )}

        <RadioGroup
          onValueChange={(value: string) => setSelectedOption(Number(value))}
          value={selectedOption !== null ? String(selectedOption) : undefined}
          className="w-full space-y-2"
        >
          {options.map((option: string, index: number) => (
            <div
              key={index}
              className="flex items-center p-3 border rounded-lg bg-white dark:bg-neutral-900 dark:hover:bg-gray-600 hover:bg-gray-100 cursor-pointer"
              onClick={() => setSelectedOption(index)}
            >
              <RadioGroupItem value={String(index)} id={`option-${index}`} className="mr-2" />
              <Label htmlFor={`option-${index}`} className="text-lg cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="mt-10 w-full space-y-4">
        <Progress
          value={(timeLeft / timeLimit) * 100}
          max={100}
          className="w-full"
        />

        <div className="flex flex-row justify-between items-center w-full">
            <p>{timeLeft}/{timeLimit}</p>
            <Button onClick={handleGoToNextQuestion} className="bg-blue-500 hover:bg-blue-800">
                Neste <ChevronRight />
            </Button>
        </div>
      </div>
    </div>
  );
};




interface QuizProps {
  questions: QuestionType[];
  passThreshold: number;
  quizId: string;
  title: string;
  baseUrl: string;
  numberOfQuestions: number;
  token: string;
}

const Quiz: React.FC<QuizProps> = ({
  questions,
  passThreshold,
  numberOfQuestions,
  quizId,
  title,
  baseUrl,
  token,
}) => {
  const [numberOfCorrects, setNumberOfCorrects] = useState<number>(0);
  const [numberOfQuestionsCompleted, setNumberOfQuestionsCompleted] = useState<number>(0);
  const [passed, setPassed] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuestionType[]>([]);
  const router = useRouter();


  //adjust the shuffled questions to the correct lenght
  useEffect(() => {
    setShuffledQuestions([...questions].sort(() => Math.random() - 0.5).slice(0, numberOfQuestions));
  }, [questions, numberOfQuestions]);

  const incrementCorrectAnswer = useCallback((correct: boolean): void => {
    if (correct) {
      setNumberOfCorrects(prev => prev + 1);
    }
    setNumberOfQuestionsCompleted((prev) => prev + 1);
    setCurrentQuestion((prev) => prev + 1);
  }, []);

  const handleSubmit = async (): Promise<void> => {
    setHasSubmitted(true);

    const calculatedPassed :boolean= numberOfCorrects / shuffledQuestions.length >= passThreshold / 100;

    setPassed(calculatedPassed)

    await fetch(`${baseUrl}/submit-quiz`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: JSON.stringify({
        number_of_corrects: numberOfCorrects,
        number_of_questions: numberOfQuestionsCompleted,
        passed_quiz: calculatedPassed,
        quiz_id: quizId,
      }),
    });

    setTimeout(() => {
      router.push("/");
    }, 10000);
  };

  return (
    <div className="w-full mx-auto h-screen p-6 bg-white dark:bg-neutral-900">
      <h1 className="text-3xl font-bold text-center mb-6">{title}</h1>
      {shuffledQuestions.map((question: QuestionType, index: number) => {
        if (index === currentQuestion) {
          return (
            <Question
              key={index}
              question={question.question}
              questionNumber={index + 1}
              options={question.answer_options}
              correctOption={question.correct_option}
              image={question.image}
              onSubmitAnswer={incrementCorrectAnswer}
              timeLimit={question.time_limit}
            />
          );
        }
        return null;
      })}
      {numberOfQuestionsCompleted === shuffledQuestions.length && (
        <div className="text-center mt-6 ">
          <Button onClick={handleSubmit} className="text-lg w-1/3 bg-blue-500 dark:bg-blue-500 hover:bg-blue-900 dark:hover:bg-blue-300">
            Ferdig <TreePalm />
          </Button>
        </div>
      )}
      {hasSubmitted && passed && (
        <h3 className="text-green-500 font-semibold text-xl mt-4 text-center">
          Gratulerer! Du bestod <br/>
          Du fikk {numberOfCorrects} riktige av {shuffledQuestions.length} <br/>
          Du trenger {Math.ceil(shuffledQuestions.length*passThreshold/100)} for å bestå.
        </h3>
      )}
      {hasSubmitted && !passed && (
        <h3 className="text-red-500 font-semibold text-xl mt-4 text-center">
          Beklager, du bestod ikke.<br/>
          Du fikk {numberOfCorrects} riktige av {shuffledQuestions.length} <br/>
          Du trenger {Math.ceil(shuffledQuestions.length*passThreshold/100)} for å bestå.
        </h3>
      )}
    </div>
  );
};

export default Quiz;