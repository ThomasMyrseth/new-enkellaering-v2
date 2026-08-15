"use client"
import { QuestionType, QuizMetaDataType } from "@/app/quiz/types";
import { useFetch } from "./use-fetch";

export function useQuiz(quizId: string | null) {
    return useFetch<QuestionType[]>(
        quizId ? "/get-quiz" : null,
        (json) => json.quiz ?? [],
        [],
        { auth: false, method: "POST", body: { quiz_id: quizId }, deps: [quizId] }
    );
}

export function useQuizMetaData(quizId: string | null) {
    return useFetch<QuizMetaDataType | null>(
        quizId ? "/get-quiz-meta-data" : null,
        (json) => json.quizzes ?? null,
        null,
        { auth: false, method: "POST", body: { quiz_id: quizId }, deps: [quizId] }
    );
}
