"use client"
import { Student } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useMyStudents() {
    return useFetch<Student[]>("/get-students", (json) => json.students ?? [], []);
}
