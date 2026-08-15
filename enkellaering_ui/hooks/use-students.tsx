"use client"
import { Student } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useStudents() {
    return useFetch<Student[]>("/get-all-students", (json) => json.students ?? [], []);
}
