"use client"
import { StudentsWithoutTeacher } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

// Note: backend response key is "students_without_teacher" for this endpoint too.
export function useNewStudentsWithPreferredTeacher() {
    return useFetch<StudentsWithoutTeacher[]>(
        "/get-new-students-with-preferred-teacher",
        (json) => json.students_without_teacher ?? [],
        []
    );
}
