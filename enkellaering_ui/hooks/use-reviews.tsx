"use client"
import { Review } from "@/app/admin/types";
import { useFetch } from "./use-fetch";

export function useReviews() {
    return useFetch<Review[]>("/get-all-reviews", (json) => json.reviews ?? [], [], { auth: false });
}
