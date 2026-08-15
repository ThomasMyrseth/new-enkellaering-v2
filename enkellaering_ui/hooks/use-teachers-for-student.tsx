"use client"
import { Teacher } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useTeachersForStudent() {
    return useFetch<Teacher[]>("/get-teacher-for-student", (json) => json.teachers ?? [], []);
}
