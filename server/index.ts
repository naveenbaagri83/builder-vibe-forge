import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSearch } from "./routes/search";
import { handleChat } from "./routes/chat";
import { handleArticles } from "./routes/articles";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Demo
  app.get("/api/demo", handleDemo);

  // Space Biology KE APIs
  app.get("/api/chat", handleChat);
  app.post("/api/chat", handleChat);
  app.get("/api/search", handleSearch);
  app.post("/api/search", handleSearch);
  app.get("/api/articles", handleArticles);

  return app;
}
