import type { SourceDoc } from "@shared/api";

const HISTORY_KEY = "sbke.searchHistory.v1";
const BOOKMARKS_KEY = "sbke.bookmarks.v1";

export interface SearchHistoryItem {
  id: string; // uuid or timestamp-based
  query: string;
  ts: number;
}

export interface BookmarkItem {
  id: string; // SourceDoc.id
  title: string;
  link: string;
  source?: SourceDoc["source"];
  mission?: string | null;
  organism?: string | null;
  assay?: string | null;
  date?: string | null;
  image?: string | null;
  ts: number;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function addSearchHistory(query: string) {
  const list = readJSON<SearchHistoryItem[]>(HISTORY_KEY, []);
  const trimmed = query.trim();
  if (!trimmed) return;
  const ts = Date.now();
  const item: SearchHistoryItem = { id: `${ts}-${Math.random().toString(36).slice(2)}` , query: trimmed, ts };
  // de-dup: keep most recent first
  const next = [item, ...list.filter((i) => i.query.toLowerCase() !== trimmed.toLowerCase())].slice(0, 50);
  writeJSON(HISTORY_KEY, next);
}

export function getSearchHistory(): SearchHistoryItem[] {
  return readJSON<SearchHistoryItem[]>(HISTORY_KEY, []);
}

export function clearSearchHistory() {
  writeJSON(HISTORY_KEY, []);
}

export function addBookmark(doc: SourceDoc) {
  const list = readJSON<BookmarkItem[]>(BOOKMARKS_KEY, []);
  const exists = list.find((b) => b.id === doc.id);
  const item: BookmarkItem = {
    id: doc.id,
    title: doc.title,
    link: doc.link,
    source: doc.source,
    mission: doc.mission ?? null,
    organism: doc.organism ?? null,
    assay: doc.assay ?? null,
    date: doc.date ?? null,
    image: doc.image ?? null,
    ts: Date.now(),
  };
  const next = exists
    ? [item, ...list.filter((b) => b.id !== doc.id)]
    : [item, ...list].slice(0, 200);
  writeJSON(BOOKMARKS_KEY, next);
}

export function removeBookmark(id: string) {
  const list = readJSON<BookmarkItem[]>(BOOKMARKS_KEY, []);
  writeJSON(BOOKMARKS_KEY, list.filter((b) => b.id !== id));
}

export function getBookmarks(): BookmarkItem[] {
  return readJSON<BookmarkItem[]>(BOOKMARKS_KEY, []);
}

export function isBookmarked(id: string): boolean {
  const list = readJSON<BookmarkItem[]>(BOOKMARKS_KEY, []);
  return list.some((b) => b.id === id);
}
