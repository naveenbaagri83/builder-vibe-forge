import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ArticleCard from "@/components/ArticleCard";
import type { ArticlesResponse } from "@shared/api";
import { apiGet } from "@/lib/api";

export default function ArticlesPage() {
  const [items, setItems] = useState<ArticlesResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiGet(`/articles`);
        setItems(resp as ArticlesResponse);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen container mx-auto px-6 py-10">
      <div className="mb-6">
        <Link to="/" className="text-indigo-600 hover:underline">← Home</Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">Articles</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items?.items?.length ? (
          items.items.map((it) => <ArticleCard key={it.id} item={it} />)
        ) : (
          <p className="text-muted-foreground">No articles available.</p>
        )}
      </div>
    </div>
  );
}
