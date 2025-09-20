import { useEffect, useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import Dashboard from "@/components/Dashboard";
import ExperimentCard from "@/components/ExperimentCard";
import ArticleCard from "@/components/ArticleCard";
import type { ArticlesResponse, SearchResponse } from "@shared/api";
import { Link } from "react-router-dom";

export default function Index() {
  const [experiments, setExperiments] = useState<SearchResponse | null>(null);
  const [articles, setArticles] = useState<ArticlesResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { apiGet } = await import("@/lib/api");
        const [sr, ar] = await Promise.all([
          apiGet(`/search?${new URLSearchParams({ query: "space biology" }).toString()}`),
          apiGet(`/articles`),
        ]);
        setExperiments(sr as SearchResponse);
        setArticles(ar as ArticlesResponse);
      } catch (e) {
        console.error("Initial data load failed:", e);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(99,102,241,0.25),transparent),radial-gradient(800px_400px_at_90%_10%,rgba(14,165,233,0.25),transparent)]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="relative container mx-auto px-6 py-20 text-center text-slate-100">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-cyan-300">
            Space Biology Knowledge Engine
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl mx-auto">
            Ask questions about GeneLab, LSDA, OSDR, CMR and more. We search NASA sources first, then Gemini fills in the gaps.
          </p>
          <div className="mt-8 max-w-3xl mx-auto">
            <ChatPanel />
          </div>
          <div className="mt-6 text-sm text-slate-400">
            Always returns: short summary, detailed answer, numbered sources, and 2 follow-up queries.
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="container mx-auto px-6 py-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-700 underline">Open full dashboard</Link>
        </div>
        <Dashboard />
      </section>

      {/* Experiments grid */}
      <section className="container mx-auto px-6 py-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Experiments</h2>
          <div className="text-sm text-muted-foreground">From NASA OSDR / GeneLab / CMR</div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiments?.results.slice(0, 6).map((e) => (
            <ExperimentCard key={e.id} exp={e} />
          ))}
        </div>
      </section>

      {/* History & Bookmarks */}
      <section className="container mx-auto px-6 py-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Your activity</h2>
          <div className="text-sm text-muted-foreground">Recent searches and saved items</div>
        </div>
        <HistoryBookmarks />
      </section>

      {/* Articles */}
      <section className="container mx-auto px-6 py-14">
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Articles</h2>
          <Link to="/articles" className="text-indigo-600 hover:text-indigo-700 underline">See more</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles?.items.slice(0, 6).map((a) => (
            <ArticleCard key={a.id} item={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
