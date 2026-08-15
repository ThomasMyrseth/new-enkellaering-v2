"use client"
import { Classes } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useClasses() {
    return useFetch<Classes[]>("/get-all-classes", (json) => json.classes ?? [], []);
}
