"use client"
import { TeacherOrderJoinStudent } from "@/app/min-side/types";
import { useFetch } from "./use-fetch";

export function useNewOrdersForTeacher() {
    return useFetch<TeacherOrderJoinStudent[]>("/get-new-students-for-teacher", (json) => json.new_orders ?? [], []);
}
