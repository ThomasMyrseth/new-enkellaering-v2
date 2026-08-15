"use client"
import { Teacher } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useTeacher() {
    return useFetch<Teacher | null>("/get-teacher", (json) => json.teacher ?? null, null);
}
