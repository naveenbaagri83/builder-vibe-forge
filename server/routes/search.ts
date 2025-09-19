import { RequestHandler } from "express";
import type { SearchRequest, SearchResponse } from "@shared/api";
import { aggregateSearch } from "../services/nasa";

export const handleSearch: RequestHandler = async (req, res) => {
  try {
    const body = (req.method === "GET" ? req.query : req.body) as any;
    const payload: SearchRequest = {
      query: String(body.query || "").slice(0, 500),
      filters: body.filters ?? {},
      limit: body.limit ? Number(body.limit) : 10,
    };

    if (!payload.query) {
      res.status(400).json({ error: "Missing query" });
      return;
    }

    const data: SearchResponse = await aggregateSearch(payload);
    res.status(200).json(data);
  } catch (err) {
    console.error("/api/search error", err);
    res.status(500).json({ error: "Search failed" });
  }
};
