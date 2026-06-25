import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();
const dataDir = path.join(process.cwd(), "data");
const eventsFile = path.join(dataDir, "events.json");

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readEvents(): any[] {
  ensureDataDir();
  if (!fs.existsSync(eventsFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(eventsFile, "utf-8"));
  } catch {
    return [];
  }
}

function writeEvents(data: any[]) {
  ensureDataDir();
  fs.writeFileSync(eventsFile, JSON.stringify(data, null, 2));
}

router.get("/events", (_req, res) => {
  res.json(readEvents());
});

router.post("/events", (req, res) => {
  const items = readEvents();
  const newItem = { ...req.body, id: Date.now() };
  items.push(newItem);
  writeEvents(items);
  res.status(201).json(newItem);
});

router.put("/events/:id", (req, res) => {
  const items = readEvents();
  const idx = items.findIndex((i: any) => String(i.id) === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  items[idx] = { ...items[idx], ...req.body, id: items[idx].id };
  writeEvents(items);
  res.json(items[idx]);
});

router.delete("/events/:id", (req, res) => {
  let items = readEvents();
  items = items.filter((i: any) => String(i.id) !== req.params.id);
  writeEvents(items);
  res.json({ ok: true });
});

export default router;
