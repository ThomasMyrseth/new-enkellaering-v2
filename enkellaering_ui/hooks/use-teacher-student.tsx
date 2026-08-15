"use client"
import { TeacherStudent } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

// /get-teacher-student has no @token_required on the backend
export function useTeacherStudent() {
    return useFetch<TeacherStudent[]>("/get-teacher-student", (json) => json.teacher_student ?? [], [], { auth: false });
}
