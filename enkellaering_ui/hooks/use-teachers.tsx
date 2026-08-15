"use client"
import { Teacher } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useTeachers(includeResigned = false) {
    const path = `/get-all-teachers?resigned=${includeResigned}`;
    return useFetch<Teacher[]>(path, (json) => json.teachers ?? [], [], { deps: [includeResigned] });
}
