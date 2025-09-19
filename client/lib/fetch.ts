export async function fetchJson<T = any>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!res.ok) {
    // Try to surface JSON error if possible
    try {
      const parsed = JSON.parse(text);
      throw new Error(parsed?.error || parsed?.message || JSON.stringify(parsed));
    } catch {
      const snippet = text.trim().slice(0, 500);
      throw new Error(`Request failed with status ${res.status}: ${snippet}`);
    }
  }

  if (ct.includes("application/json") || text.trim().startsWith("{" ) || text.trim().startsWith("[")) {
    try {
      return JSON.parse(text) as T;
    } catch (e) {
      throw new Error(`Failed to parse JSON response: ${(e as Error).message}`);
    }
  }

  // Received HTML or other content
  const snippet = text.trim().slice(0, 500);
  throw new Error(`Expected JSON but received: ${snippet}`);
}
