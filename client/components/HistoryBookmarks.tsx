import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSearchHistory, clearSearchHistory, getBookmarks, removeBookmark, type BookmarkItem, type SearchHistoryItem } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function HistoryBookmarks() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  const refresh = () => {
    setHistory(getSearchHistory());
    setBookmarks(getBookmarks());
  };

  useEffect(() => {
    refresh();
    const i = setInterval(refresh, 2000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Search History</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => { clearSearchHistory(); refresh(); }}>Clear</Button>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent searches.</p>
          ) : (
            <ul className="text-sm space-y-2">
              {history.slice(0, 10).map((h) => (
                <li key={h.id} className="flex items-center justify-between">
                  <Link to={`/dashboard?${new URLSearchParams({ q: h.query }).toString()}`} className="text-indigo-600 hover:underline">
                    {h.query}
                  </Link>
                  <span className="text-muted-foreground text-xs">{new Date(h.ts).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bookmarks</CardTitle>
        </CardHeader>
        <CardContent>
          {bookmarks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookmarks yet.</p>
          ) : (
            <ul className="text-sm space-y-3">
              {bookmarks.slice(0, 10).map((b) => (
                <li key={b.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/experiment/${encodeURIComponent(b.id)}`} className="text-indigo-600 hover:underline line-clamp-2">
                      {b.title}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-1">
                      {b.source} {b.mission ? `• ${b.mission}` : ""} {b.organism ? `• ${b.organism}` : ""}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { removeBookmark(b.id); refresh(); }}>Remove</Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
