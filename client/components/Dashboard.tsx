import { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SearchResponse } from "@shared/api";

export default function Dashboard() {
  const [query, setQuery] = useState("space biology");
  const [mission, setMission] = useState("");
  const [organism, setOrganism] = useState("");
  const [assay, setAssay] = useState("");
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // read ?q= from URL
    try {
      const sp = new URLSearchParams(window.location.search);
      const q = sp.get("q");
      if (q) setQuery(q);
    } catch {}
    onSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = async () => {
    setLoading(true);
    try {
      const [{ apiGet }, { addSearchHistory }] = await Promise.all([
        import("@/lib/api"),
        import("@/lib/storage"),
      ]);
      addSearchHistory(query);
      const qp = new URLSearchParams({ query });
      const json = (await apiGet(`/search?${qp.toString()}`)) as SearchResponse;
      setData(json);
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const timeline = useMemo(() => {
    const items = data?.results || [];
    // group by year
    const byYear: Record<string, number> = {};
    items.forEach((d) => {
      const y = d.date ? new Date(d.date).getFullYear().toString() : "Unknown";
      byYear[y] = (byYear[y] || 0) + 1;
    });
    const years = Object.keys(byYear).sort();
    return { x: years, y: years.map((y) => byYear[y]) };
  }, [data]);

  const scatter = useMemo(() => {
    const items = data?.results || [];
    // pseudo mapping score (source priority) to y and year to x
    const pri: Record<string, number> = { GENELAB: 3, OSDR: 2, CMR: 1, IMAGES: 1 };
    const x: number[] = [];
    const y: number[] = [];
    const text: string[] = [];
    items.forEach((d) => {
      const year = d.date ? new Date(d.date).getFullYear() : 0;
      x.push(year);
      y.push(pri[d.source] || 0);
      text.push(d.title);
    });
    return { x, y, text };
  }, [data]);


  // Sources count
  const sourcesCount = useMemo(() => {
    const items = data?.results || [];
    const count: Record<string, number> = {};
    items.forEach((d) => {
      count[d.source] = (count[d.source] || 0) + 1;
    });
    return count;
  }, [data]);

  // Organisms
  const organisms = useMemo(() => {
    const items = data?.results || [];
    const orgs = Array.from(new Set(items.map((d) => d.organism).filter(Boolean)));
    return orgs;
  }, [data]);

  // Recent experiments
  const recentExperiments = useMemo(() => {
    const items = data?.results || [];
    return items.slice(0, 6);
  }, [data]);

  // Knowledge Graph (simple)
  const knowledgeGraph = useMemo(() => {
    const items = data?.results || [];
    return items.map((d) => ({
      title: d.title,
      source: d.source,
      organism: d.organism,
      year: d.date ? new Date(d.date).getFullYear() : "Unknown",
    }));
  }, [data]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Query" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Input placeholder="Mission" value={mission} onChange={(e) => setMission(e.target.value)} />
          <Input placeholder="Organism" value={organism} onChange={(e) => setOrganism(e.target.value)} />
          <Input placeholder="Assay type" value={assay} onChange={(e) => setAssay(e.target.value)} />
          <Button onClick={onSearch} disabled={loading}>{loading ? "Loading..." : "Apply"}</Button>
        </CardContent>
        <CardHeader>
          <CardTitle>Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-4 text-sm">
            {Object.entries(sourcesCount).map(([src, cnt]) => (
              <li key={src}>{src}: <b>{cnt}</b></li>
            ))}
          </ul>
        </CardContent>
        <CardHeader>
          <CardTitle>Organisms</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-4 text-sm">
            {organisms.map((org) => (
              <li key={org}>{org}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Timeline of experiments</CardTitle>
        </CardHeader>
        <CardContent>
          <Plot
            data={[{ type: "bar", x: timeline.x, y: timeline.y, marker: { color: "#8b5cf6" } }]}
            layout={{ autosize: true, height: 280, margin: { l: 40, r: 10, t: 10, b: 40 }, paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)", font: { color: "#0f172a" } }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: "100%" }}
          />
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Scatter: Source priority vs. Year</CardTitle>
        </CardHeader>
        <CardContent>
          <Plot
            data={[{ x: scatter.x, y: scatter.y, text: scatter.text, mode: "markers", type: "scatter", marker: { size: 8, color: "#22d3ee" } }]}
            layout={{ autosize: true, height: 320, margin: { l: 40, r: 10, t: 10, b: 40 }, paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)", font: { color: "#0f172a" } }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: "100%" }}
          />
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Knowledge Graph (simple)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1">Title</th>
                  <th className="px-2 py-1">Source</th>
                  <th className="px-2 py-1">Organism</th>
                  <th className="px-2 py-1">Year</th>
                </tr>
              </thead>
              <tbody>
                {knowledgeGraph.map((row, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-2 py-1">{row.title}</td>
                    <td className="px-2 py-1">{row.source}</td>
                    <td className="px-2 py-1">{row.organism}</td>
                    <td className="px-2 py-1">{row.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Recent Experiments</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-4 text-sm">
            {recentExperiments.map((exp) => (
              <li key={exp.id}><b>{exp.title}</b> <span className="text-gray-500">({exp.date ? new Date(exp.date).getFullYear() : "Unknown"})</span></li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
