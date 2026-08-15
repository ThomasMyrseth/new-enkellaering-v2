"use client"
import { useEffect, useState } from "react";
import { HelpQueueEntry } from "@/app/admin/types";
import { apiFetch, ApiError } from "@/lib/api";

export function useHelpQueuePosition(
    queueId: string | null,
    opts?: { pollIntervalMs?: number; onNotFound?: () => void }
): [HelpQueueEntry | null, boolean, string | null] {
    const [position, setPosition] = useState<HelpQueueEntry | null>(null);
    const [loading, setLoading] = useState<boolean>(queueId !== null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (queueId === null) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        const pollIntervalMs = opts?.pollIntervalMs ?? 5000;

        async function fetchPosition() {
            try {
                const json = await apiFetch<any>(`/help-queue/position/${queueId}`, { auth: false });
                if (cancelled) return;
                setPosition(json.position ?? null);
                setError(null);
            } catch (err) {
                if (cancelled) return;
                if (err instanceof ApiError && err.status === 404) {
                    opts?.onNotFound?.();
                    return;
                }
                setError(err instanceof ApiError ? err.message : "En feil har skjedd, prøv igjen");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchPosition();
        const interval = setInterval(fetchPosition, pollIntervalMs);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queueId]);

    return [position, loading, error];
}
