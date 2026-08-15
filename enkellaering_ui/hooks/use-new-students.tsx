"use client"
import { NewStudent } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useNewStudents() {
    return useFetch<NewStudent[]>("/get-new-students", (json) => json.new_students ?? [], []);
}
