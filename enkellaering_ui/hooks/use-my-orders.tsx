"use client"
import { TeacherOrderJoinTeacher } from "@/app/min-side/types";
import { useFetch } from "./use-fetch";

export function useMyOrders() {
    return useFetch<TeacherOrderJoinTeacher[]>("/get-new-orders", (json) => json.teachers ?? [], []);
}
