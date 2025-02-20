"use client"
import React, { useState, useEffect } from "react";
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

  const handleGoToNextQuestion = (): void => {
    onSubmitAnswer(selectedOption === correctOption);
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      handleGoToNextQuestion();
      return;
    }
    const timer: NodeJS.Timeout = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg flex flex-col items-center space-y-4">
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
        className="w-full space-y-2"
      >
        {options.map((option: string, index: number) => (
          <div
            key={index}
            className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <RadioGroupItem value={option} id={`option-${index}`} className="mr-2" />
            <Label htmlFor={`option-${index}`} className="text-lg">
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>

      <Progress
        value={(timeLeft / timeLimit) * 100}
        max={100}
        className="w-full my-4"
      />

        <div className="flex flex-row justify-between items-center w-full">
            <p>{timeLeft}/{timeLimit}</p>
            <Button onClick={handleGoToNextQuestion} className="mt-4 bg-blue-500 hover:bg-blue-600">
                Neste <ChevronRight />
            </Button>
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
  token: string;
}

const Quiz: React.FC<QuizProps> = ({
  questions,
  passThreshold,
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
  const router = useRouter();

  // Randomly reshuffle the order of the questions
  const shuffledQuestions: QuestionType[] = questions.sort(() => Math.random() - 0.5);

  const incrementCorrectAnswer = (correct: boolean): void => {
    if (correct) {
      setNumberOfCorrects((prev) => prev + 1);
    }
    setNumberOfQuestionsCompleted((prev) => prev + 1);
    setCurrentQuestion((prev) => prev + 1);
  };

  const handleSubmit = async (): Promise<void> => {
    setHasSubmitted(true);

    if (numberOfCorrects / numberOfQuestionsCompleted >= passThreshold) {
      setPassed(true);
    } else {
      setPassed(false);
      return;
    }

    const res = await fetch(`${baseUrl}/submit-quiz`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: JSON.stringify({
        numberOfCorrects: numberOfCorrects,
        numberOfQuestions: numberOfQuestionsCompleted,
        passed: passed,
        quizId: quizId,
      }),
    });

    if (!res.ok) {
      alert("En feil har skjedd, venligst prøv igjen");
      return;
    }

    router.push("/min-side-laerer");
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6">{title}</h1>
      {shuffledQuestions.map((question: QuestionType, index: number) => {
        if (index === currentQuestion) {
          return (
            <Question
              key={index}
              question={question.question}
              questionNumber={index + 1}
              options={question.options}
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
        <div className="text-center mt-6">
          <Button onClick={handleSubmit} className="bg-green-500 hover:bg-green-600">
            Submit <TreePalm />
          </Button>
        </div>
      )}
      {hasSubmitted && passed && (
        <h3 className="text-green-500 font-semibold text-xl mt-4 text-center">
          Gratulerer! Du bestod
        </h3>
      )}
      {hasSubmitted && !passed && (
        <h3 className="text-red-500 font-semibold text-xl mt-4 text-center">
          Beklager, du bestod ikke.
        </h3>
      )}
    </div>
  );
};

export default Quiz;