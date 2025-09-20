const KEY = "sbke.authed.v1";

export function isAuthed(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setAuthed(v: boolean) {
  try {
    if (v) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {}
}
