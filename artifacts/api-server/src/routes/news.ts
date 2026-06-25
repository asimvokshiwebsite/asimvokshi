import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();
const dataDir = path.join(process.cwd(), "data");
const newsFile = path.join(dataDir, "news.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readNews(): any[] {
  ensureDataDir();
  if (!fs.existsSync(newsFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(newsFile, "utf-8"));
  } catch {
    return [];
  }
}

function writeNews(data: any[]) {
  ensureDataDir();
  fs.writeFileSync(newsFile, JSON.stringify(data, null, 2));
}

router.get("/news", (_req, res) => {
  res.json(readNews());
});

router.post("/news", (req, res) => {
  const items = readNews();
  const newItem = {
    ...req.body,
    id: Date.now(),
    publishedAt: new Date().toISOString(),
  };
  items.unshift(newItem);
  writeNews(items);
  res.status(201).json(newItem);
});

router.put("/news/:id", (req, res) => {
  const items = readNews();
  const idx = items.findIndex((i: any) => String(i.id) === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  items[idx] = { ...items[idx], ...req.body, id: items[idx].id };
  writeNews(items);
  res.json(items[idx]);
});

router.delete("/news/:id", (req, res) => {
  let items = readNews();
  items = items.filter((i: any) => String(i.id) !== req.params.id);
  writeNews(items);
  res.json({ ok: true });
});

export default router;
