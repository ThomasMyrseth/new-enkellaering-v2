"use client"
import { HelpSession } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

// Pass a changing refreshKey (e.g. incremented after creating/deleting a session)
// to force an immediate refetch.
export function useMyHelpSessions(refreshKey: number = 0) {
    return useFetch<HelpSession[]>("/teacher/my-sessions", (json) => json.sessions ?? [], [], {
        deps: [refreshKey]
    });
}
