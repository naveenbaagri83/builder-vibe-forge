import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ArticleItem } from "@shared/api";

export default function ArticleCard({ item }: { item: ArticleItem }) {
  return (
    <a href={item.link} target="_blank" rel="noreferrer">
      <Card className="hover:shadow-lg transition-shadow h-full">
        <CardHeader>
          <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {item.image && (
            <img src={item.image} alt={item.title} className="w-full h-40 object-cover rounded-md mb-3" />
          )}
          {item.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{item.excerpt}</p>}
        </CardContent>
      </Card>
    </a>
  );
}
