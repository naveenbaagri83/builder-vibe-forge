import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SourceDoc } from "@shared/api";
import { Link } from "react-router-dom";

export default function ExperimentCard({ exp }: { exp: SourceDoc }) {
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { isBookmarked } = await import("@/lib/storage");
        if (!mounted) return;
        setSaved(Boolean(isBookmarked(exp.id)));
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [exp.id]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { isBookmarked, addBookmark, removeBookmark } = await import("@/lib/storage");
      const now = Boolean(isBookmarked(exp.id));
      if (now) removeBookmark(exp.id);
      else addBookmark(exp);
      setSaved(!now);
    } catch {
      // ignore
    }
  };

  return (
    <Link to={`/experiment/${encodeURIComponent(exp.id)}`}>
      <Card className="hover:shadow-lg transition-shadow h-full relative">
        <button onClick={toggle} className={`absolute right-3 top-3 text-xs px-2 py-1 rounded-md ${saved ? "bg-amber-500 text-black" : "bg-slate-800 text-slate-100"}`} aria-label={saved ? "Remove bookmark" : "Add bookmark"}>
          {saved ? "Bookmarked" : "Bookmark"}
        </button>
        <CardHeader>
          <CardTitle className="text-base line-clamp-2 pr-20">{exp.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {exp.image && (
            <img src={exp.image} alt={exp.title} className="w-full h-40 object-cover rounded-md mb-3" />
          )}
          <div className="text-sm text-muted-foreground space-y-1">
            {exp.mission && <p><span className="font-medium text-foreground">Mission:</span> {exp.mission}</p>}
            {exp.organism && <p><span className="font-medium text-foreground">Organism:</span> {exp.organism}</p>}
            {exp.assay && <p><span className="font-medium text-foreground">Assay:</span> {exp.assay}</p>}
            {exp.date && <p><span className="font-medium text-foreground">Date:</span> {new Date(exp.date).toDateString()}</p>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
