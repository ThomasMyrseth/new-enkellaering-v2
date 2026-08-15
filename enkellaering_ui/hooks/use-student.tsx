"use client"
import { Student } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useStudent() {
    return useFetch<Student | null>("/get-student", (json) => json.student ?? null, null);
}
