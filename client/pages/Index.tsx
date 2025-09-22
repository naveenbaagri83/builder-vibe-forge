import { useEffect, useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import Dashboard from "@/components/Dashboard";
import ExperimentCard from "@/components/ExperimentCard";
import ArticleCard from "@/components/ArticleCard";
import HistoryBookmarks from "@/components/HistoryBookmarks";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
    <>
      <Header />
      <div className="min-h-screen bg-black text-white">
        {/* Hero */}
  <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 w-full h-full z-0">
            <video
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              src="/assets/1851190-uhd_3840_2160_25fps.mp4"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60" />
          </div>
          <div className="relative container mx-auto px-6 py-20 text-center text-slate-100 z-10">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-cyan-300 pt-40 md:pt-56 mb-4">
              Space Biology Knowledge Engine
            </h1>
            <p className="mt-4 text-white font-bold max-w-2xl mx-auto">
              "Explore, connect, and visualize decades of space biology research in one intelligent dashboard."
              <br />
              <span className="block mt-2">Ask questions about GeneLab, LSDA, OSDR, CMR and more.</span>
            </p>
            <div className="mt-2 text-sm text-slate-400">
              <span className="text-white font-bold">Always returns: short summary, detailed answer, numbered sources, and 2 follow-up queries.</span>
            </div>
          </div>
        </section>

        {/* Dashboard preview */}
        <section className="container mx-auto px-6 py-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <Link
              to="/dashboard"
              className="text-indigo-600 hover:text-indigo-700 underline"
            >
              {/* Open full dashboard */}
            </Link>
          </div>
          <Dashboard />
        </section>

        {/* Experiments grid */}
        <section className="container mx-auto px-6 py-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold">Experiments</h2>
            <div className="text-sm text-muted-foreground">
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
        <section className="container mx-auto px-6 py-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold">Your activity</h2>
            <div className="text-sm text-muted-foreground">
              Recent searches and saved items
            </div>
          </div>
          <HistoryBookmarks />
        </section>

        {/* Articles */}
        <section className="container mx-auto px-6 py-14">
          <div className="flex items-end justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold">Articles</h2>
            <Link
              to="/articles"
              className="text-indigo-600 hover:text-indigo-700 underline"
            >
              See more
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles?.items.slice(0, 6).map((a) => (
              <ArticleCard key={a.id} item={a} />
            ))}
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
}
