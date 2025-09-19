/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Query and filter models
export interface SearchFilters {
  mission?: string | null;
  organism?: string | null;
  assayType?: string | null;
  startDate?: string | null; // ISO date
  endDate?: string | null; // ISO date
}

export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  limit?: number;
}

export interface SourceDoc {
  id: string;
  title: string;
  description?: string;
  link: string;
  source: "GENELAB" | "OSDR" | "CMR" | "IMAGES" | "LSDA" | "RADLAB" | "OPEN_DATA" | "OTHER";
  mission?: string | null;
  organism?: string | null;
  assay?: string | null;
  date?: string | null; // ISO date string if available
  image?: string | null;
}

export interface SearchResponse {
  total: number;
  results: SourceDoc[];
}

export interface ChatRequest {
  query: string;
  filters?: SearchFilters;
}

export interface ChatResponse {
  shortSummary: string;
  detailedAnswer: string;
  sources: { index: number; title: string; link: string; source: SourceDoc["source"]; }[];
  followUps: string[];
  usedFallback: boolean; // true if answered by Gemini fallback
}

export interface ArticleItem {
  id: string;
  title: string;
  excerpt?: string;
  image?: string | null;
  link: string;
  date?: string | null;
}

export interface ArticlesResponse {
  items: ArticleItem[];
}
