"use client"
import { Task } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useTasks() {
    return useFetch<Task[]>("/task/all", (json) => json.tasks ?? [], []);
}

export function useTeacherTasks() {
    return useFetch<Task[]>("/task/teacher-tasks/all", (json) => json.tasks ?? [], []);
}
