import { Router } from "express";
import { ensurePublishingTables, pool } from "@workspace/db";
import { requireAdminAuth } from "./admin-auth";

const router = Router();

type NewsDuration = "6h" | "24h" | "3d" | "1w";

type NewsItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string | null;
  publishedAt: string;
  featured: boolean;
  popup: boolean;
  duration: NewsDuration;
  expiresAt: string | null;
};

type NewsRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string | null;
  published_at: Date | string;
  featured: boolean;
  popup: boolean;
  duration: NewsDuration;
  expires_at: Date | string | null;
};

function rowToNews(row: NewsRow): NewsItem {
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    category: row.category,
    imageUrl: row.image_url,
    publishedAt: new Date(row.published_at).toISOString(),
    featured: row.featured,
    popup: row.popup,
    duration: row.duration,
    expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
  };
}

async function purgeExpiredNews(): Promise<void> {
  await ensurePublishingTables();
  await pool.query("DELETE FROM admin_news WHERE expires_at IS NOT NULL AND expires_at <= NOW()");
}

const newsCleanupTimer = setInterval(() => {
  void purgeExpiredNews().catch(() => {});
}, 15 * 60 * 1000);
newsCleanupTimer.unref();

function durationMilliseconds(duration: NewsDuration): number {
  return {
    "6h": 6 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "3d": 3 * 24 * 60 * 60 * 1000,
    "1w": 7 * 24 * 60 * 60 * 1000,
  }[duration];
}

async function readNews(): Promise<NewsItem[]> {
  await purgeExpiredNews();
  const result = await pool.query<NewsRow>(`
    SELECT id, slug, title, excerpt, content, category, image_url, published_at, featured, popup, duration, expires_at
    FROM admin_news
    ORDER BY published_at DESC
  `);
  return result.rows.map(rowToNews);
}

function sanitizeString(val: unknown, maxLen: number): string {
  if (typeof val !== "string") return "";
  return val.replace(/<[^>]*>/g, "").trim().slice(0, maxLen);
}

type NewsValidation =
  | { ok: true; data: Omit<NewsItem, "id" | "publishedAt"> }
  | { ok: false; error: string };

function validateNewsBody(body: any): NewsValidation {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Të dhënat e lajmit janë të pavlefshme." };
  }
  const title = sanitizeString(body.title, 200);
  const slug = sanitizeString(body.slug, 200).replace(/[^a-z0-9-]/gi, "-");
  const excerpt = sanitizeString(body.excerpt, 500);
  const content = sanitizeString(body.content, 20000);
  const category = sanitizeString(body.category, 60);
  const imageUrl = sanitizeString(body.imageUrl ?? "", 5_500_000);
  const featured = Boolean(body.featured);
  const popup = Boolean(body.popup);
  const duration: NewsDuration = body.duration === "6h" || body.duration === "24h" || body.duration === "3d" || body.duration === "1w"
    ? body.duration
    : "1w";

  if (!title) return { ok: false, error: "Titulli është i detyrueshëm." };
  if (!content) return { ok: false, error: "Përmbajtja është e detyrueshme." };
  if (imageUrl && !isSafeImageUrl(imageUrl)) {
    return { ok: false, error: "Përdorni një foto lokale ose një adresë HTTPS." };
  }

  return {
    ok: true,
    data: {
      title,
      slug,
      excerpt,
      content,
      category,
      imageUrl: imageUrl || null,
      featured,
      popup,
      duration,
      expiresAt: null,
    },
  };
}

function isSafeImageUrl(value: string): boolean {
  if (value.startsWith("data:image/")) {
    return /^data:image\/(?:jpeg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(value) && value.length <= 5_500_000;
  }
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

router.get("/news", async (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(await readNews());
});

router.get("/news/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({ error: "ID e pavlefshme." });
    return;
  }
  const item = (await readNews()).find((entry) => entry.id === id);
  if (!item) {
    res.status(404).json({ error: "Lajmi nuk u gjet." });
    return;
  }
  res.setHeader("Cache-Control", "no-store");
  res.json(item);
});

router.post("/news", requireAdminAuth, async (req, res) => {
  const v = validateNewsBody(req.body);
  if (!v.ok) { res.status(400).json({ error: v.error }); return; }

  await ensurePublishingTables();
  const id = Date.now();
  const publishedAt = new Date();
  const duration = v.data.popup ? "24h" : v.data.duration;
  const expiresAt = new Date(publishedAt.getTime() + durationMilliseconds(duration));
  const result = await pool.query<NewsRow>(`
    INSERT INTO admin_news (id, slug, title, excerpt, content, category, image_url, published_at, featured, popup, duration, expires_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id, slug, title, excerpt, content, category, image_url, published_at, featured, popup, duration, expires_at
  `, [id, v.data.slug, v.data.title, v.data.excerpt, v.data.content, v.data.category, v.data.imageUrl, publishedAt, v.data.featured, v.data.popup, duration, expiresAt]);
  const newItem = rowToNews(result.rows[0]);
  req.log?.info({ event: "news_published", recordId: newItem.id }, "News published");
  res.status(201).json(newItem);
});

router.put("/news/:id", requireAdminAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) { res.status(400).json({ error: "ID e pavlefshme." }); return; }

  const v = validateNewsBody(req.body);
  if (!v.ok) { res.status(400).json({ error: v.error }); return; }

  await ensurePublishingTables();
  const duration = v.data.popup ? "24h" : v.data.duration;
  const expiresAt = new Date(Date.now() + durationMilliseconds(duration));
  const result = await pool.query<NewsRow>(`
    UPDATE admin_news
    SET slug = $2, title = $3, excerpt = $4, content = $5, category = $6, image_url = $7, featured = $8, popup = $9, duration = $10, expires_at = $11
    WHERE id = $1
    RETURNING id, slug, title, excerpt, content, category, image_url, published_at, featured, popup, duration, expires_at
  `, [id, v.data.slug, v.data.title, v.data.excerpt, v.data.content, v.data.category, v.data.imageUrl, v.data.featured, v.data.popup, duration, expiresAt]);
  if (!result.rows[0]) { res.status(404).json({ error: "Lajmi nuk u gjet." }); return; }

  const updated = rowToNews(result.rows[0]);
  req.log?.info({ event: "news_updated", recordId: id }, "News updated");
  res.json(updated);
});

router.delete("/news/:id", requireAdminAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) { res.status(400).json({ error: "ID e pavlefshme." }); return; }

  await ensurePublishingTables();
  const result = await pool.query("DELETE FROM admin_news WHERE id = $1", [id]);
  if (result.rowCount !== 1) { res.status(404).json({ error: "Lajmi nuk u gjet." }); return; }

  req.log?.info({ event: "news_deleted", recordId: id }, "News deleted");
  res.json({ ok: true });
});

export default router;
