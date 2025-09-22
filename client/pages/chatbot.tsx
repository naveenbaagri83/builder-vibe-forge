import ChatPanel from "@/components/ChatPanel";
import Header from "@/components/Header";
import ExperimentCard from "@/components/ExperimentCard";
import HistoryBookmarks from "@/components/HistoryBookmarks";
import { useEffect, useState } from "react";
import type { SearchResponse } from "@shared/api";
import { apiGet } from "@/lib/api";

export default function ChatBotPage() {
  const [experiments, setExperiments] = useState<SearchResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const sr = await apiGet(`/search?query=space biology`);
        setExperiments(sr as SearchResponse);
      } catch (e) {
        console.error("Experiment data load failed:", e);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white w-full">
      <Header />
      <div className="h-16" />
      <div className="container mx-auto px-6 py-10">
        <ChatPanel />

        {/* Experiments grid */}
        <section className="py-10">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold">Experiments</h2>
            <div className="text-sm text-white">
              From NASA OSDR / GeneLab / CMR
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiments?.results?.slice(0, 6).map((e) => (
              <ExperimentCard key={e.id} exp={e} />
            ))}
            {!experiments?.results?.length && (
              <p className="text-sm text-muted-foreground">
                No experiments to display.
              </p>
            )}
          </div>
        </section>

        {/* History & Bookmarks */}
        <section className="py-10">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold">Your activity</h2>
            <div className="text-sm text-white">
              Recent searches and saved items
            </div>
          </div>
          <HistoryBookmarks />
        </section>
      </div>
  </div>
  );
}
