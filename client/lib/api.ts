import { fetchJson } from "./fetch";

function normalizeEndpoint(endpoint: string) {
  if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;
  return endpoint;
}

function isDevEnv() {
  // @ts-ignore
  return typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.DEV;
}

// Try a set of candidate bases depending on environment (dev vs preview)
const CANDIDATE_BASES = (isDev = isDevEnv()) => {
  if (isDev) return ["/api"];
  // Use VITE_API_BASE from environment variables in production
  const apiBase = (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.VITE_API_BASE) || "/api";
  return [apiBase];
};

export async function apiFetch<T = any>(endpoint: string, init?: RequestInit): Promise<T> {
  const e = normalizeEndpoint(endpoint.replace(/^\/api/, ""));
  const bases = CANDIDATE_BASES();
  let lastErr: any = null;
  for (const b of bases) {
    const attempts = [] as string[];
    // relative path
    attempts.push(b + e);
    // absolute with origin
    if (typeof window !== "undefined") {
      try {
        attempts.push(window.location.origin + b + e);
      } catch {}
    }

    for (const url of attempts) {
      try {
        // Log attempted URL for debugging in preview
        // eslint-disable-next-line no-console
        console.debug("apiFetch trying:", url);
        return await fetchJson<T>(url, init);
      } catch (err: any) {
        lastErr = err;
        // If response was HTML, try next candidate
        if (String(err.message).includes("Expected JSON but received")) continue;
        // For network errors or CORS, try next candidate
        continue;
      }
    }
  }
  // If we reach here, all candidate bases failed (likely API server not running in this environment)
  const msg = String(lastErr?.message || lastErr || "API unreachable");
  console.warn("API fetch fallback — returning empty data. Underlying error:", msg);

  // Provide sensible fallbacks for known endpoints so the UI remains usable in static previews
  const path = e.split("?")[0];
  if (path.startsWith("/search")) {
    return { total: 0, results: [] } as unknown as T;
  }
  if (path.startsWith("/articles")) {
    return { items: [] } as unknown as T;
  }
  if (path.startsWith("/chat")) {
    return {
      shortSummary: "Server unavailable — demo fallback",
      detailedAnswer:
        "The backend API is not reachable in this preview. To enable live chat, run the dev server locally (pnpm dev) or deploy the serverless function. Meanwhile this demo response indicates where the AI answer would appear.",
      sources: [],
      followUps: ["Show example missions", "List common assays used in space biology"],
      usedFallback: false,
    } as unknown as T;
  }

  throw lastErr || new Error("Failed to fetch API");
}

export async function apiGet<T = any>(endpoint: string) {
  return apiFetch<T>(endpoint, { method: "GET" });
}

export async function apiPost<T = any>(endpoint: string, body?: any) {
  return apiFetch<T>(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
