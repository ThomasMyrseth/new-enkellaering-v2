"use client"
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";

type FetchState<T> = [T, boolean, string | null, Dispatch<SetStateAction<T>>];

export function useFetch<T>(
    path: string | null,
    select: (json: any) => T,
    initialValue: T,
    opts?: { auth?: boolean; method?: string; body?: unknown; deps?: unknown[] }
): FetchState<T> {
    const [data, setData] = useState<T>(initialValue);
    const [loading, setLoading] = useState<boolean>(path !== null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (path === null) {
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        let cancelled = false;

        setLoading(true);
        setError(null);

        apiFetch<any>(path, { auth: opts?.auth, method: opts?.method, body: opts?.body, signal: controller.signal })
            .then((json) => {
                if (!cancelled) setData(select(json));
            })
            .catch((err) => {
                if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return;
                setError(err instanceof ApiError ? err.message : "En feil har skjedd, prøv igjen");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, ...(opts?.deps ?? [])]);

    return [data, loading, error, setData];
}
