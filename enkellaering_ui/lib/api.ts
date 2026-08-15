import { BASE_URL } from "./CONSTS";

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
}

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

type ApiFetchOptions = {
    method?: string;
    body?: unknown;
    auth?: boolean;
    signal?: AbortSignal;
};

export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
    const { method = "GET", body, auth = true, signal } = opts;

    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (auth) {
        const token = getToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal,
    });

    if (!response.ok) {
        let message = response.statusText;
        try {
            const errorJson = await response.json();
            message = errorJson?.error ?? errorJson?.message ?? message;
        } catch {
            // response had no JSON body, fall back to statusText
        }
        throw new ApiError(message, response.status);
    }

    return response.json() as Promise<T>;
}
