"use client"
import { AvailableSubject } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useAvailableSubjects() {
    return useFetch<AvailableSubject[]>("/get-all-available-subjects", (json) => json ?? [], [], { auth: false });
}
