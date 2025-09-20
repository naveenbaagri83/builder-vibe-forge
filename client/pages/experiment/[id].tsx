import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiGet } from "@/lib/api";
import type { SourceDoc } from "@shared/api";

export default function ExperimentDetail() {
  const { id } = useParams();
  const [item, setItem] = useState<SourceDoc | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Search for the specific id
        const resp = await apiGet(`/search?${new URLSearchParams({ query: id }).toString()}`);
        const results = (resp as any).results || [];
        const found = results.find((r: SourceDoc) => r.id === id) || results.find((r: SourceDoc) => r.id === decodeURIComponent(id));
        if (found) {
          setItem(found as SourceDoc);
        } else {
          setError("Experiment not found in NASA indexes.");
        }
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="mb-6">
        <Link to="/" className="text-indigo-600 hover:underline">← Back to Home</Link>
      </div>

      {loading && <p>Loading experiment...</p>}
      {error && (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
            <p className="mt-3 text-sm">Try searching with a different id or return to the dashboard.</p>
          </CardContent>
        </Card>
      )}

      {item && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-col gap-2">
                <CardTitle className="text-2xl">{item.title}</CardTitle>
                <div>
                  <button
                    onClick={async () => {
                      const { isBookmarked, addBookmark, removeBookmark } = await import("@/lib/storage");
                      if (isBookmarked(item.id)) removeBookmark(item.id); else addBookmark(item);
                      // no state kept; HistoryBookmarks panel polls to reflect changes
                    }}
                    className="text-xs px-3 py-1 rounded-md bg-slate-900 text-slate-100 hover:bg-slate-800"
                  >
                    Toggle bookmark
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {item.image && <img src={item.image} alt={item.title} className="w-full h-72 object-cover rounded-md mb-4" />}
                <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{item.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">Mission</p>
                    <p>{item.mission ?? "—"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Organism</p>
                    <p>{item.organism ?? "—"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Assay</p>
                    <p>{item.assay ?? "—"}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Date</p>
                    <p>{item.date ? new Date(item.date).toDateString() : "—"}</p>
                  </div>
                </div>
                <div className="mt-6">
                  <a href={item.link} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Open source record</a>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Files & Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">This demo fetches only metadata. In a full deployment, links to raw/processed files and data bundles would appear here (when available from the source).</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <aside>
            <Card>
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2">
                  <li><a href={`${item.link}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">View original metadata</a></li>
                  <li><a href={item.image ?? "#"} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Open image</a></li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}
