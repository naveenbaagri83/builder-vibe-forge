import type { ChatRequest, ChatResponse, SourceDoc } from "@shared/api";
import { RequestHandler } from "express";
import fetch from "node-fetch";
import { aggregateSearch } from "../services/nasa";

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY or GOOGLE_API_KEY");
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `You are an assistant specialized in space biology. Answer concisely and factually. If relevant, structure as: Short summary (2–3 lines), Detailed answer, Numbered sources (if provided), and 2 suggested follow-up queries.\n\nQuestion: ${prompt}`,
          },
        ],
      },
    ],
  };
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const json = (await r.json()) as any;
  const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("\n") ?? "";
  return text || "I don't have an answer right now.";
}

function buildNASAAnswer(query: string, docs: SourceDoc[]): ChatResponse {
  const top = docs.slice(0, 5);
  const shortSummary = `Found ${docs.length} relevant NASA records for "${query}" across OSDR/GeneLab, CMR, and NASA Images.`;
  const points = top
    .map((d, i) => `(${i + 1}) ${d.title}${d.mission ? ` — ${d.mission}` : ""}${d.organism ? ` — ${d.organism}` : ""}`)
    .join("\n");
  const detailedAnswer = `Key findings:\n${points}\n\nThese records include metadata such as mission context, organism, and assay type when available. Use the dashboard filters to refine by mission, organism, date range, or assay.`;
  const sources = top.map((d, i) => ({ index: i + 1, title: d.title, link: d.link, source: d.source }));
  const followUps = [
    `Show experiments about ${query} on rodent or plant models`,
    `List RNA-Seq assays related to ${query} and provide processed files`,
  ];
  return { shortSummary, detailedAnswer, sources, followUps, usedFallback: false };
}

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const anyBody = (req.method === "GET" ? req.query : req.body) as any;
    const body: ChatRequest = {
      query: String(anyBody?.query ?? anyBody?.q ?? ""),
      filters: anyBody?.filters,
    };
    if (!body.query) {
      res.status(400).json({ error: "Missing query" });
      return;
    }

    // NASA-first retrieval
    const search = await aggregateSearch({ query: body.query, filters: body.filters, limit: 8 });
    if (search.total > 0) {
      const response = buildNASAAnswer(body.query, search.results);
      res.status(200).json(response);
      return;
    }

    // Gemini fallback
    let text = "";
    try {
      text = await callGemini(body.query);
    } catch (e) {
      console.warn("Gemini fallback unavailable", e);
    }
    const resp: ChatResponse = {
      shortSummary: text ? text.split("\n").slice(0, 2).join(" ") : `No NASA records found for "${body.query}" and Gemini fallback unavailable.`,
      detailedAnswer: text || "Gemini API key not configured. Please set GEMINI_API_KEY to enable general Q&A.",
      sources: [],
      followUps: [
        `Try a different phrasing: ${body.query} in spaceflight context`,
        "Ask about a specific mission or organism (e.g., Rodent Research, Arabidopsis).",
      ],
      usedFallback: !!text,
    };
    res.status(200).json(resp);
  } catch (err) {
    console.error("/api/chat error", err);
    res.status(500).json({ error: "Chat failed" });
  }
};
