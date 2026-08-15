const STORAGE_KEY = "ea_attribution";

export type Attribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  gclid: string | null;
  referrer: string | null;
  landing_page: string | null;
};

export function captureAttributionFromURL(): void {
  if (typeof window === "undefined") return;

  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return; // first-touch: don't overwrite

    const params = new URLSearchParams(window.location.search);
    const attribution: Attribution = {
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_content: params.get("utm_content"),
      utm_term: params.get("utm_term"),
      fbclid: params.get("fbclid"),
      gclid: params.get("gclid"),
      referrer: document.referrer || null,
      landing_page: window.location.pathname + window.location.search,
    };

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // sessionStorage unavailable (e.g. private browsing) - skip silently
  }
}

export function getStoredAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}
