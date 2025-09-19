import { fetchJson } from "./fetch";

function normalizeEndpoint(endpoint: string) {
  if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;
  return endpoint;
}

export function apiBase() {
  // During development vite integrates express and uses /api
  // In hosted previews (Netlify serverless) the express app is exposed under /.netlify/functions/api
  // Use Vite env flag to decide
  // @ts-ignore - Vite env
  const isDev = typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.DEV;
  return isDev ? "/api" : "/.netlify/functions/api";
}

export async function apiFetch<T = any>(endpoint: string, init?: RequestInit): Promise<T> {
  const e = normalizeEndpoint(endpoint.replace(/^\/api/, ""));
  const url = apiBase() + e;
  return fetchJson<T>(url, init);
}

export async function apiGet<T = any>(endpoint: string) {
  return apiFetch<T>(endpoint, { method: "GET" });
}

export async function apiPost<T = any>(endpoint: string, body?: any) {
  return apiFetch<T>(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
