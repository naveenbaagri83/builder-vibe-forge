import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SourceDoc } from "@shared/api";
import { Link } from "react-router-dom";

export default function ExperimentCard({ exp }: { exp: SourceDoc }) {
  return (
    <Link to={`/experiment/${encodeURIComponent(exp.id)}`}>
      <Card className="hover:shadow-lg transition-shadow h-full">
        <CardHeader>
          <CardTitle className="text-base line-clamp-2">{exp.title}</CardTitle>
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
