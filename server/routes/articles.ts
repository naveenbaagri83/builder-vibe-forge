import type { ArticlesResponse, ArticleItem } from "@shared/api";
import { RequestHandler } from "express";
import fetch from "node-fetch";

const USER_AGENT = "SpaceBioKE/1.0 (+https://projects.builder.codes)";

export const handleArticles: RequestHandler = async (_req, res) => {
  try {
    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(
      "space biology",
    )}&media_type=image`;
    const r = await fetch(url, { headers: { "User-Agent": USER_AGENT } as any });
    const json = (await r.json()) as any;
    const items: ArticleItem[] = (json?.collection?.items ?? []).slice(0, 12).map((it: any, i: number) => {
      const meta = it?.data?.[0] ?? {};
      const links = it?.links ?? [];
      const img = links.find((l: any) => l?.rel === "preview" || l?.render === "image")?.href ?? null;
      return {
        id: meta?.nasa_id || String(i),
        title: meta?.title || "NASA Image",
        excerpt: (meta?.description || "").slice(0, 220),
        image: img,
        link: `https://images.nasa.gov/details-${meta?.nasa_id ?? ""}`,
        date: meta?.date_created ?? null,
      };
    });
    const resp: ArticlesResponse = { items };
    res.status(200).json(resp);
  } catch (e) {
    console.error("/api/articles error", e);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
};
