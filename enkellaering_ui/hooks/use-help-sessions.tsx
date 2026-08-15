"use client"
import { HelpSession } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useActiveHelpSessions() {
    return useFetch<HelpSession[]>("/help-sessions/active", (json) => json.sessions ?? [], [], { auth: false });
}

export function useUpcomingHelpSessions() {
    return useFetch<HelpSession[]>("/help-sessions", (json) => json.sessions ?? [], [], { auth: false });
}
