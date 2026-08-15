"use client"
import { useEffect, useState } from "react";
import { HelpQueueEntry } from "@/app/admin/types";
import { apiFetch, ApiError } from "@/lib/api";
import { toast } from "sonner";

// Polls the teacher's active-session queue. Pass a changing refreshKey
// (e.g. incremented after admit/complete/no-show) to force an immediate refetch.
export function useHelpQueue(refreshKey: number = 0, pollIntervalMs = 10000): [HelpQueueEntry[], boolean, string | null] {
    const [queue, setQueue] = useState<HelpQueueEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchQueue() {
            try {
                const json = await apiFetch<any>("/teacher/queue");
                if (cancelled) return;
                const queues = json.queues ?? [];

                if (queues.length > 1) {
                    toast.warning("Du har flere aktive økter nå. Vennligst slett alle untatt én for å unngå forvirring.");
                }

                setQueue(queues.length > 0 ? queues[0].queue ?? [] : []);
                setError(null);
            } catch (err) {
                if (cancelled) return;
                setError(err instanceof ApiError ? err.message : "En feil har skjedd, prøv igjen");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchQueue();
        const interval = setInterval(fetchQueue, pollIntervalMs);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey]);

    return [queue, loading, error];
}
