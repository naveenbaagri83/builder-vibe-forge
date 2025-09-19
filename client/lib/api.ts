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
  // In production hosting, try standard /api (relies on redirects), then Netlify function explicit paths
  return ["/api", "/.netlify/functions/api", "/.netlify/functions/api/api"];
};

export async function apiFetch<T = any>(endpoint: string, init?: RequestInit): Promise<T> {
  const e = normalizeEndpoint(endpoint.replace(/^\/api/, ""));
  const bases = CANDIDATE_BASES();
  let lastErr: any = null;
  for (const b of bases) {
    const url = b + e;
    try {
      return await fetchJson<T>(url, init);
    } catch (err: any) {
      lastErr = err;
      // If response was HTML, try next candidate
      if (String(err.message).includes("Expected JSON but received")) continue;
      // For other errors, also try next candidate (network issues)
      continue;
    }
  }
  throw lastErr || new Error("Failed to fetch API");
}

export async function apiGet<T = any>(endpoint: string) {
  return apiFetch<T>(endpoint, { method: "GET" });
}

export async function apiPost<T = any>(endpoint: string, body?: any) {
  return apiFetch<T>(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
