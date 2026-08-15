"use client"
import { useFetch } from "./use-fetch";

export function useIsAdmin() {
    return useFetch<boolean>("/is-admin", (json) => json.is_admin ?? false, false);
}
