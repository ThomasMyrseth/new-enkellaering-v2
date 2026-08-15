"use client"
import { TeacherHelpConfig } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useHelpConfig() {
    return useFetch<TeacherHelpConfig | null>("/teacher/help-config", (json) => json.config ?? null, null);
}
