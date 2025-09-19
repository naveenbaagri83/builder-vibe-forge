import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChatResponse } from "@shared/api";

export default function ChatPanel() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ChatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      try {
        const { apiPost } = await import("@/lib/api");
        const json = await apiPost<ChatResponse>("/chat", { query });
        setData(json as ChatResponse);
      } catch (e: any) {
        throw e;
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/50 to-indigo-900/30 border-slate-800 text-slate-100">
      <CardHeader>
        <CardTitle className="text-xl">AI Chatbot</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="Ask about space biology experiments, missions, organisms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAsk()}
            className="bg-slate-900/60 border-slate-700 text-slate-100 placeholder:text-slate-400"
          />
          <Button onClick={onAsk} disabled={loading}>
            {loading ? "Searching..." : "Ask"}
          </Button>
        </div>
        {error && <p className="mt-3 text-red-300 text-sm">{error}</p>}
        {data && (
          <div className="mt-6 space-y-4">
            <section>
              <h3 className="font-semibold mb-1">Short summary</h3>
              <p className="text-slate-200/90">{data.shortSummary}</p>
            </section>
            <section>
              <h3 className="font-semibold mb-1">Detailed answer</h3>
              <p className="text-slate-200/90 whitespace-pre-wrap leading-relaxed">{data.detailedAnswer}</p>
            </section>
            {data.sources?.length > 0 && (
              <section>
                <h3 className="font-semibold mb-1">Sources</h3>
                <ol className="list-decimal ml-5 space-y-1">
                  {data.sources.map((s) => (
                    <li key={s.index}>
                      <a className="text-indigo-300 hover:text-indigo-200 underline" href={s.link} target="_blank" rel="noreferrer">
                        {s.title}
                      </a>
                      <span className="text-slate-400 ml-2">[{s.source}]</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {data.followUps?.length > 0 && (
              <section>
                <h3 className="font-semibold mb-1">Suggested follow-ups</h3>
                <ul className="list-disc ml-5 space-y-1">
                  {data.followUps.map((q, i) => (
                    <li key={i} className="text-slate-200/90">{q}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
