import { Router } from "express";
import { ensurePublishingTables, pool } from "@workspace/db";
import { requireAdminAuth } from "./admin-auth";

const router = Router();
const VALID_TYPES = ["akademike", "kulturore", "nderkombetare", "shkollore"] as const;
const VALID_PERIODS = ["Periudha e Parë", "Periudha e Dytë", "Periudha e Tretë"];

type EventItem = {
  id: number;
  date: string;
  month: string;
  title: string;
  desc: string;
  time?: string;
  location?: string;
  type: "akademike" | "kulturore" | "nderkombetare" | "shkollore";
  highlight: boolean;
  period: string;
};

type EventRow = {
  id: string;
  date: string;
  month: string;
  title: string;
  description: string;
  time: string | null;
  location: string | null;
  type: EventItem["type"];
  highlight: boolean;
  period: string;
};

function rowToEvent(row: EventRow): EventItem {
  return {
    id: Number(row.id),
    date: row.date,
    month: row.month,
    title: row.title,
    desc: row.description,
    ...(row.time ? { time: row.time } : {}),
    ...(row.location ? { location: row.location } : {}),
    type: row.type,
    highlight: row.highlight,
    period: row.period,
  };
}

async function readEvents(): Promise<EventItem[]> {
  await ensurePublishingTables();
  const result = await pool.query<EventRow>(`
    SELECT id, date, month, title, description, time, location, type, highlight, period
    FROM admin_events
    ORDER BY id ASC
  `);
  return result.rows.map(rowToEvent);
}

function sanitizeString(val: unknown, maxLen: number): string {
  if (typeof val !== "string") return "";
  return val.replace(/<[^>]*>/g, "").trim().slice(0, maxLen);
}

type EventValidation =
  | { ok: true; data: Omit<EventItem, "id"> }
  | { ok: false; error: string };

function validateEventBody(body: any): EventValidation {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Të dhënat e aktivitetit janë të pavlefshme." };
  }
  const title = sanitizeString(body.title, 200);
  const desc = sanitizeString(body.desc, 1000);
  const date = sanitizeString(body.date, 20);
  const month = sanitizeString(body.month, 20);
  const time = sanitizeString(body.time ?? "", 50);
  const location = sanitizeString(body.location ?? "", 200);
  const type = VALID_TYPES.includes(body.type) ? body.type : "shkollore";
  const period = VALID_PERIODS.includes(body.period) ? body.period : "Periudha e Parë";
  const highlight = Boolean(body.highlight);

  if (!title) return { ok: false, error: "Titulli është i detyrueshëm." };
  if (!desc) return { ok: false, error: "Përshkrimi është i detyrueshëm." };

  return { ok: true, data: { title, desc, date, month, time: time || undefined, location: location || undefined, type, period, highlight } };
}

router.get("/events", async (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(await readEvents());
});

router.post("/events", requireAdminAuth, async (req, res) => {
  const v = validateEventBody(req.body);
  if (!v.ok) { res.status(400).json({ error: v.error }); return; }

  await ensurePublishingTables();
  const id = Date.now();
  const result = await pool.query<EventRow>(`
    INSERT INTO admin_events (id, date, month, title, description, time, location, type, highlight, period)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, date, month, title, description, time, location, type, highlight, period
  `, [id, v.data.date, v.data.month, v.data.title, v.data.desc, v.data.time ?? null, v.data.location ?? null, v.data.type, v.data.highlight, v.data.period]);
  const newItem = rowToEvent(result.rows[0]);
  req.log?.info({ event: "calendar_event_published", recordId: newItem.id }, "Calendar event published");
  res.status(201).json(newItem);
});

router.put("/events/:id", requireAdminAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) { res.status(400).json({ error: "ID e pavlefshme." }); return; }

  const v = validateEventBody(req.body);
  if (!v.ok) { res.status(400).json({ error: v.error }); return; }

  await ensurePublishingTables();
  const result = await pool.query<EventRow>(`
    UPDATE admin_events
    SET date = $2, month = $3, title = $4, description = $5, time = $6, location = $7, type = $8, highlight = $9, period = $10
    WHERE id = $1
    RETURNING id, date, month, title, description, time, location, type, highlight, period
  `, [id, v.data.date, v.data.month, v.data.title, v.data.desc, v.data.time ?? null, v.data.location ?? null, v.data.type, v.data.highlight, v.data.period]);
  if (!result.rows[0]) { res.status(404).json({ error: "Aktiviteti nuk u gjet." }); return; }

  const updated = rowToEvent(result.rows[0]);
  req.log?.info({ event: "calendar_event_updated", recordId: id }, "Calendar event updated");
  res.json(updated);
});

router.delete("/events/:id", requireAdminAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) { res.status(400).json({ error: "ID e pavlefshme." }); return; }

  await ensurePublishingTables();
  const result = await pool.query("DELETE FROM admin_events WHERE id = $1", [id]);
  if (result.rowCount !== 1) { res.status(404).json({ error: "Aktiviteti nuk u gjet." }); return; }

  req.log?.info({ event: "calendar_event_deleted", recordId: id }, "Calendar event deleted");
  res.json({ ok: true });
});

export default router;
