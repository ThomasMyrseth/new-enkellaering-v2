"use client"
import { ClassesJoinTeacher } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useClassesForStudent() {
    return useFetch<ClassesJoinTeacher[]>("/get-classes-for-student", (json) => json.classes ?? [], []);
}
