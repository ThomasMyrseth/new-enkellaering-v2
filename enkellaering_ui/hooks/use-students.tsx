"use client"
import { Student } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useStudents(hasTeacher?: boolean) {
    const path = hasTeacher === undefined
        ? "/get-all-students"
        : `/get-all-students?has_teacher=${hasTeacher}`;
    return useFetch<Student[]>(path, (json) => json.students ?? [], [], { deps: [hasTeacher] });
}
