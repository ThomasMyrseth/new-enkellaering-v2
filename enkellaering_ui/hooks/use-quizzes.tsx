"use client"
import { Quiz } from "@/app/min-side-laerer/types";
import { useFetch } from "./use-fetch";

export function useQuizzes() {
    return useFetch<Quiz[]>("/get-all-quizzes", (json) => json.quizzes ?? [], [], { auth: false });
}
