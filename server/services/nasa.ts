import fetch from "node-fetch";
import type { SearchRequest, SearchResponse, SourceDoc } from "@shared/api";

const USER_AGENT = "SpaceBioKE/1.0 (+https://projects.builder.codes)";

async function safeJson<T = any>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// OSDR Biological Data API - keyword search in metadata
export async function searchOSDR(keyword: string, limit = 10): Promise<SourceDoc[]> {
  const url = `https://visualization.osdr.nasa.gov/biodata/api/v2/query/metadata/?keyword=${encodeURIComponent(
    keyword,
  )}&format=json`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } as any });
  const data = (await safeJson<any>(res)) as any[] | null;
  if (!Array.isArray(data)) return [];
  const items = data.slice(0, limit).map((item, i) => {
    const accession: string | undefined = item?.Dataset_Accession || item?.DatasetAccession || item?.Accession;
    const mission: string | undefined = item?.Mission || item?.mission || item?.Study_Mission;
    const organism: string | undefined = item?.Organism || item?.organism || item?.Species;
    const assay: string | undefined = item?.Assay || item?.assay || item?.Assay_Type;
    const title: string = item?.Title || item?.title || item?.Dataset_Title || `OSDR Record ${accession ?? i + 1}`;
    const link = accession
      ? `https://osdr.nasa.gov/bio/repo/data/studies/${accession}`
      : "https://osdr.nasa.gov/bio/";
    const date: string | null = item?.Release_Date || item?.date || null;
    return {
      id: `OSDR-${accession ?? i}`,
      title,
      description: item?.Description || item?.summary || undefined,
      link,
      source: "OSDR" as const,
      mission: mission ?? null,
      organism: organism ?? null,
      assay: assay ?? null,
      date,
      image: null,
    } satisfies SourceDoc;
  });
  return items;
}

// NASA CMR collections search
export async function searchCMR(keyword: string, limit = 10): Promise<SourceDoc[]> {
  const url = `https://cmr.earthdata.nasa.gov/search/collections.json?keyword=${encodeURIComponent(keyword)}&page_size=${limit}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } as any });
  const json = (await safeJson<any>(res)) as any;
  const items: SourceDoc[] = json?.feed?.entry?.slice(0, limit)?.map((e: any) => {
    const title: string = e?.dataset_id || e?.short_name || e?.title || "CMR Collection";
    const link: string = Array.isArray(e?.links)
      ? (e.links.find((l: any) => l.rel?.includes("/search/metadata"))?.href || e.links[0]?.href)
      : `https://cmr.earthdata.nasa.gov/search/concepts/${e?.id}.html`;
    return {
      id: `CMR-${e?.id ?? title}`,
      title,
      description: e?.summary || e?.description || undefined,
      link,
      source: "CMR",
      mission: e?.projects?.[0]?.short_name ?? null,
      organism: null,
      assay: null,
      date: e?.time_start ?? null,
      image: null,
    } as SourceDoc;
  }) ?? [];
  return items;
}

// NASA Images API - can double as articles-like content
export async function searchImages(keyword: string, limit = 10): Promise<SourceDoc[]> {
  const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(keyword)}&media_type=image`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } as any });
  const data = await safeJson<any>(res);
  const items: SourceDoc[] = data?.collection?.items?.slice(0, limit)?.map((it: any, i: number) => {
    const meta = it?.data?.[0] ?? {};
    const links = it?.links ?? [];
    const img = links.find((l: any) => l?.rel === "preview" || l?.render === "image")?.href ?? null;
    return {
      id: `IMAGES-${meta?.nasa_id ?? i}`,
      title: meta?.title || "NASA Image",
      description: meta?.description || undefined,
      link: `https://images.nasa.gov/details-${meta?.nasa_id ?? ""}`,
      source: "IMAGES",
      mission: meta?.keywords?.find((k: string) => /mission/i.test(k)) ?? null,
      organism: meta?.keywords?.find((k: string) => /biology|organism|life/i.test(k)) ?? null,
      assay: null,
      date: meta?.date_created ?? null,
      image: img,
    } as SourceDoc;
  }) ?? [];
  return items;
}

// Placeholder GeneLab search harness via OSDR, as GeneLab feeds into OSDR
export async function searchGeneLab(keyword: string, limit = 10): Promise<SourceDoc[]> {
  // Reuse OSDR but tag as GENELAB when accession looks like GLDS-xxx
  const osdr = await searchOSDR(keyword, limit * 2);
  const mapped = osdr
    .filter((d) => /GLDS-|GLDS\d+/i.test(d.title) || /GLDS-/i.test(d.id))
    .slice(0, limit)
    .map((d) => ({ ...d, source: "GENELAB" as const }));
  return mapped;
}

export async function aggregateSearch(req: SearchRequest): Promise<SearchResponse> {
  const q = req.query.trim();
  const limit = req.limit ?? 10;

  const [osdr, cmr, images, genelab] = await Promise.all([
    searchOSDR(q, limit),
    searchCMR(q, limit),
    searchImages(q, limit),
    searchGeneLab(q, limit),
  ]);

  // Simple scoring: prioritize OSDR/GENELAB over others
  const priority = { GENELAB: 3, OSDR: 2, CMR: 1, IMAGES: 1 } as const;
  const all = [...genelab, ...osdr, ...cmr, ...images];
  const results = all
    .map((d, i) => ({ d, score: priority[d.source as keyof typeof priority] ?? 0, i }))
    .sort((a, b) => (b.score - a.score) || (a.i - b.i))
    .slice(0, limit * 2)
    .map((x) => x.d);

  return { total: results.length, results };
}
