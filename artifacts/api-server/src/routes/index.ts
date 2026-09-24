import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminAuthRouter from "./admin-auth";
import newsRouter from "./news";
import eventsRouter from "./events";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminAuthRouter);
router.use(newsRouter);
router.use(eventsRouter);

router.get("/maps/script", async (_req, res) => {
  const mapsApiKey = process.env.FRONTEND_FORGE_API_KEY;
  if (!mapsApiKey) {
    res.status(503).json({ error: "Shërbimi i hartës nuk është konfiguruar." });
    return;
  }

  let upstreamUrl: URL;
  try {
    const baseUrl = process.env.FRONTEND_FORGE_API_URL ?? "https://forge.butterfly-effect.dev";
    upstreamUrl = new URL("/v1/maps/proxy/maps/api/js", baseUrl);
  } catch {
    res.status(503).json({ error: "Shërbimi i hartës nuk është konfiguruar." });
    return;
  }

  upstreamUrl.searchParams.set("key", mapsApiKey);
  upstreamUrl.searchParams.set("v", "weekly");
  upstreamUrl.searchParams.set("libraries", "marker,places,geocoding,geometry");

  try {
    const upstream = await fetch(upstreamUrl, { signal: AbortSignal.timeout(10_000) });
    if (!upstream.ok) {
      res.status(502).json({ error: "Shërbimi i hartës nuk është i disponueshëm." });
      return;
    }

    const contentType = upstream.headers.get("content-type") ?? "application/javascript; charset=utf-8";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    res.status(502).json({ error: "Shërbimi i hartës nuk është i disponueshëm." });
  }
});

export default router;
