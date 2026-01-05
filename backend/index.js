import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import { createClient } from "redis";

const app = express();
app.use(cors());

const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

await redis.connect();

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/api/list", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url" });

  const cacheKey = `dir:${encodeURIComponent(url)}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json({ items: JSON.parse(cached), cached: true });
  }

  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const items = [];
  $("a").each((_, el) => {
    const name = $(el).text().trim();
    const href = $(el).attr("href");

    if (name && name !== "Parent Directory") {
      items.push({
        name,
        href,
        isDir: href.endsWith("/"),
      });
    }
  });

  await redis.set(cacheKey, JSON.stringify(items), { EX: 900 });
  res.json({ items, cached: false });
});

app.listen(4000, () => {
  console.log("Backend listening on port 4000");
});
