"use client"
import { ClassesJoinTeacher } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useClassesForTeacher() {
    return useFetch<ClassesJoinTeacher[]>("/get-classes-for-teacher", (json) => json.classes ?? [], []);
}

// Separate endpoint used specifically by the teacher revenue chart - not confirmed
// identical to /get-classes-for-teacher, kept distinct to avoid changing behavior.
export function useClassesForTeacherRevenue() {
    return useFetch<ClassesJoinTeacher[]>("/fetch-classes-for-teacher", (json) => json.classes ?? [], []);
}
