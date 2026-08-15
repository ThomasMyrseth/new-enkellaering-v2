"use client"
import { HelpSession } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

// Pass a changing refreshKey (e.g. incremented after deleting a session) to force an immediate refetch.
export function useAdminHelpSessions(refreshKey: number = 0) {
    return useFetch<HelpSession[]>("/admin/help-sessions", (json) => json.sessions ?? [], [], {
        deps: [refreshKey]
    });
}
