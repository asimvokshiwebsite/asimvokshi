import { Router } from "express";
import fs from "fs";
import path from "path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { requireAdminAuth } from "./admin-auth";

const router = Router();
const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data");
const newsFile = path.join(dataDir, "news.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
}

function readNews(): any[] {
  ensureDataDir();
  if (!fs.existsSync(newsFile)) return [];
  try {
    const data: unknown = JSON.parse(fs.readFileSync(newsFile, "utf-8"));
    if (!Array.isArray(data)) throw new Error("Stored news data is not an array");
    return data;
  } catch {
    throw new Error("Stored news data could not be read");
  }
}

function writeNews(data: any[]) {
  ensureDataDir();
  const temporaryFile = path.join(dataDir, `.news-${randomUUID()}.tmp`);
  fs.writeFileSync(temporaryFile, JSON.stringify(data, null, 2), { mode: 0o600 });
  fs.renameSync(temporaryFile, newsFile);
}

function sanitizeString(val: unknown, maxLen: number): string {
  if (typeof val !== "string") return "";
  return val.replace(/<[^>]*>/g, "").trim().slice(0, maxLen);
}

function validateNewsBody(body: any): { ok: boolean; error?: string; data?: any } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Të dhënat e lajmit janë të pavlefshme." };
  }
  const title = sanitizeString(body.title, 200);
  const slug = sanitizeString(body.slug, 200).replace(/[^a-z0-9-]/gi, "-");
  const excerpt = sanitizeString(body.excerpt, 500);
  const content = sanitizeString(body.content, 20000);
  const category = sanitizeString(body.category, 60);
  const imageUrl = sanitizeString(body.imageUrl ?? "", 500);
  const featured = Boolean(body.featured);

  if (!title) return { ok: false, error: "Titulli është i detyrueshëm." };
  if (!content) return { ok: false, error: "Përmbajtja është e detyrueshme." };
  if (imageUrl && !isSafeImageUrl(imageUrl)) {
    return { ok: false, error: "Përdorni një foto lokale ose një adresë HTTPS." };
  }

  return { ok: true, data: { title, slug, excerpt, content, category, imageUrl: imageUrl || null, featured } };
}

function isSafeImageUrl(value: string): boolean {
  if (value.startsWith("/images/")) {
    return !value.includes("..") && !value.includes("\\") && !value.includes("\0");
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

router.get("/news", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(readNews());
});

router.get("/news/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ error: "ID e pavlefshme." });
    return;
  }
  const item = readNews().find((entry: any) => entry.id === id);
  if (!item) {
    res.status(404).json({ error: "Lajmi nuk u gjet." });
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  res.json(item);
});

router.post("/news", requireAdminAuth, (req, res) => {
  const v = validateNewsBody(req.body);
  if (!v.ok) { res.status(400).json({ error: v.error }); return; }

  const items = readNews();
  const newItem = { ...v.data, id: Date.now(), publishedAt: new Date().toISOString() };
  items.unshift(newItem);
  writeNews(items);
  req.log?.info({ event: "news_published", recordId: newItem.id }, "News published");
  res.status(201).json(newItem);
});

router.put("/news/:id", requireAdminAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) { res.status(400).json({ error: "ID e pavlefshme." }); return; }

  const v = validateNewsBody(req.body);
  if (!v.ok) { res.status(400).json({ error: v.error }); return; }

  const items = readNews();
  const idx = items.findIndex((i: any) => i.id === id);
  if (idx === -1) { res.status(404).json({ error: "Lajmi nuk u gjet." }); return; }

  items[idx] = { ...items[idx], ...v.data, id };
  writeNews(items);
  req.log?.info({ event: "news_updated", recordId: id }, "News updated");
  res.json(items[idx]);
});

router.delete("/news/:id", requireAdminAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) { res.status(400).json({ error: "ID e pavlefshme." }); return; }

  let items = readNews();
  const before = items.length;
  items = items.filter((i: any) => i.id !== id);
  if (items.length === before) { res.status(404).json({ error: "Lajmi nuk u gjet." }); return; }

  writeNews(items);
  req.log?.info({ event: "news_deleted", recordId: id }, "News deleted");
  res.json({ ok: true });
});

export default router;
