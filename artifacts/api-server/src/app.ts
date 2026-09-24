import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { isAllowedOrigin } from "./lib/origin-policy";

const app: Express = express();
app.disable("x-powered-by");

// ── Security headers ──────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // frontend is served separately
    crossOriginResourcePolicy: { policy: "same-site" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  }),
);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, cb) => {
      // Non-browser clients omit Origin; browser origins must match exactly.
      if (!origin || isAllowedOrigin(origin)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  }),
);

// ── Rate limiting ─────────────────────────────────────────────────────────────
// General limit for all /api routes
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,      // 1 minute
    max: 120,                  // 120 requests/min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Shumë kërkesa. Provoni përsëri pas një minute." },
  }),
);

// Stricter limit for write operations
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    skip: (req) => req.method === "GET" || req.method === "HEAD",
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Shumë operacione shkrimi. Provoni përsëri pas pak." },
  }),
);

// ── Body parsing (size-limited) ───────────────────────────────────────────────
app.use(express.json({ limit: "64kb" }));
app.use(cookieParser());

// ── Request logging ───────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", router);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({ error: "CORS: origjina e palejuar." });
    return;
  }
  const errorType = (err as Error & { type?: string }).type;
  if (errorType === "entity.parse.failed") {
    res.status(400).json({ error: "Formati i kërkesës është i pavlefshëm." });
    return;
  }
  if (errorType === "entity.too.large") {
    res.status(413).json({ error: "Kërkesa është shumë e madhe." });
    return;
  }
  res.status(500).json({ error: "Gabim i brendshëm i serverit." });
});

export default app;
