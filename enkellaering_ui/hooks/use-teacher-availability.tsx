"use client"
import { TeacherWithHelpConfig } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

// Pass a changing refreshKey (e.g. incremented after toggling a teacher's availability)
// to force an immediate refetch.
export function useTeacherAvailability(refreshKey: number = 0) {
    return useFetch<TeacherWithHelpConfig[]>("/admin/teachers/availability", (json) => json.teachers_availability ?? [], [], {
        deps: [refreshKey]
    });
}
