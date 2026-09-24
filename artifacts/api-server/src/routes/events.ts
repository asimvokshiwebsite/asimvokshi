import { Router } from "express";
import fs from "fs";
import path from "path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { requireAdminAuth } from "./admin-auth";

const router = Router();
const dataDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../data");
const eventsFile = path.join(dataDir, "events.json");

const VALID_TYPES = ["akademike", "kulturore", "nderkombetare", "shkollore"] as const;
const VALID_PERIODS = ["Periudha e Parë", "Periudha e Dytë", "Periudha e Tretë"];

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
}

function readEvents(): any[] {
  ensureDataDir();
  if (!fs.existsSync(eventsFile)) return [];
  try {
    const data: unknown = JSON.parse(fs.readFileSync(eventsFile, "utf-8"));
    if (!Array.isArray(data)) throw new Error("Stored event data is not an array");
    return data;
  } catch {
    throw new Error("Stored event data could not be read");
  }
}

function writeEvents(data: any[]) {
  ensureDataDir();
  const temporaryFile = path.join(dataDir, `.events-${randomUUID()}.tmp`);
  fs.writeFileSync(temporaryFile, JSON.stringify(data, null, 2), { mode: 0o600 });
  fs.renameSync(temporaryFile, eventsFile);
}

function sanitizeString(val: unknown, maxLen: number): string {
  if (typeof val !== "string") return "";
  return val.replace(/<[^>]*>/g, "").trim().slice(0, maxLen);
}

function validateEventBody(body: any): { ok: boolean; error?: string; data?: any } {
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

router.get("/events", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(readEvents());
});

router.post("/events", requireAdminAuth, (req, res) => {
  const v = validateEventBody(req.body);
  if (!v.ok) { res.status(400).json({ error: v.error }); return; }

  const items = readEvents();
  const newItem = { ...v.data, id: Date.now() };
  items.push(newItem);
  writeEvents(items);
  req.log?.info({ event: "calendar_event_published", recordId: newItem.id }, "Calendar event published");
  res.status(201).json(newItem);
});

router.put("/events/:id", requireAdminAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) { res.status(400).json({ error: "ID e pavlefshme." }); return; }

  const v = validateEventBody(req.body);
  if (!v.ok) { res.status(400).json({ error: v.error }); return; }

  const items = readEvents();
  const idx = items.findIndex((i: any) => i.id === id);
  if (idx === -1) { res.status(404).json({ error: "Aktiviteti nuk u gjet." }); return; }

  items[idx] = { ...items[idx], ...v.data, id };
  writeEvents(items);
  req.log?.info({ event: "calendar_event_updated", recordId: id }, "Calendar event updated");
  res.json(items[idx]);
});

router.delete("/events/:id", requireAdminAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) { res.status(400).json({ error: "ID e pavlefshme." }); return; }

  let items = readEvents();
  const before = items.length;
  items = items.filter((i: any) => i.id !== id);
  if (items.length === before) { res.status(404).json({ error: "Aktiviteti nuk u gjet." }); return; }

  writeEvents(items);
  req.log?.info({ event: "calendar_event_deleted", recordId: id }, "Calendar event deleted");
  res.json({ ok: true });
});

export default router;
