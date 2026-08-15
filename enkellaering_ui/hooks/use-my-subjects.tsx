"use client"
import { AvailableSubject } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useMySubjects() {
    return useFetch<AvailableSubject[]>("/get-available-subjects", (json) => json.available_subjects ?? [], []);
}
