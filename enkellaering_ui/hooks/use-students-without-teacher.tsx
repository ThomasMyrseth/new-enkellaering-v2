"use client"
import { Student } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useStudentsWithoutTeacher() {
    return useFetch<Student[]>("/get-student-without-teacher", (json) => json.students ?? [], []);
}
