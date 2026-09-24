import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { Router, type NextFunction, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import { isAllowedOrigin } from "../lib/origin-policy";

const router = Router();
const COOKIE_NAME = "av_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const SESSION_ID_LENGTH = 43;
const SESSION_SECRET = process.env.SESSION_SECRET ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const passwordSalt =
  SESSION_SECRET.length >= 32
    ? createHmac("sha256", SESSION_SECRET).update("school-admin-password-salt").digest()
    : null;
const configuredPasswordHash = passwordSalt && ADMIN_PASSWORD ? scryptSync(ADMIN_PASSWORD, passwordSalt, 64) : null;

// Sessions are deliberately held only by the API process. A restart invalidates existing sessions.
const sessions = new Map<string, number>();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Shumë tentativa hyrjeje. Provoni përsëri pas 15 minutash." },
});

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/api",
  };
}

function trustedBrowserRequest(req: Request): boolean {
  const origin = req.get("origin");
  return Boolean(origin && isAllowedOrigin(origin));
}

function authConfigurationReady(): boolean {
  return Boolean(configuredPasswordHash && SESSION_SECRET.length >= 32);
}

function sessionStoreKey(sessionId: string): string {
  return createHmac("sha256", SESSION_SECRET).update(sessionId).digest("base64url");
}

function discardExpiredSessions(now = Date.now()) {
  for (const [key, expiresAt] of sessions) {
    if (expiresAt <= now) sessions.delete(key);
  }
}

function createSession(): string | null {
  if (!authConfigurationReady()) return null;

  discardExpiredSessions();
  const sessionId = randomBytes(32).toString("base64url");
  sessions.set(sessionStoreKey(sessionId), Date.now() + SESSION_TTL_MS);
  return sessionId;
}

function hasValidSession(sessionId: string | undefined): boolean {
  if (!sessionId || sessionId.length !== SESSION_ID_LENGTH || !/^[A-Za-z0-9_-]+$/.test(sessionId)) {
    return false;
  }

  const key = sessionStoreKey(sessionId);
  const expiresAt = sessions.get(key);
  if (!expiresAt || expiresAt <= Date.now()) {
    if (expiresAt) sessions.delete(key);
    return false;
  }
  return true;
}

function destroySession(sessionId: string | undefined) {
  if (sessionId) sessions.delete(sessionStoreKey(sessionId));
}

router.post("/admin/login", loginLimiter, (req, res) => {
  if (!trustedBrowserRequest(req)) {
    res.status(403).json({ error: "Origjina e kërkesës nuk lejohet." });
    return;
  }

  if (!authConfigurationReady()) {
    req.log?.error({ event: "admin_auth_not_configured" }, "Admin authentication is not configured");
    res.status(503).json({ error: "Hyrja administrative nuk është konfiguruar në server." });
    return;
  }

  const password = req.body?.password;
  if (typeof password !== "string" || password.length > 1024) {
    res.status(401).json({ error: "Fjalëkalimi nuk është i saktë." });
    return;
  }

  const candidateHash = scryptSync(password, passwordSalt!, 64);
  if (!timingSafeEqual(candidateHash, configuredPasswordHash!)) {
    req.log?.warn({ event: "admin_login_failed" }, "Admin login failed");
    res.status(401).json({ error: "Fjalëkalimi nuk është i saktë." });
    return;
  }

  const sessionId = createSession();
  if (!sessionId) {
    res.status(503).json({ error: "Hyrja administrative nuk është konfiguruar në server." });
    return;
  }

  res.cookie(COOKIE_NAME, sessionId, { ...cookieOptions(), maxAge: SESSION_TTL_MS });
  res.setHeader("Cache-Control", "no-store");
  req.log?.info({ event: "admin_login_succeeded" }, "Admin login succeeded");
  res.json({ authenticated: true });
});

router.get("/admin/session", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json({ authenticated: authConfigurationReady() && hasValidSession(req.cookies?.[COOKIE_NAME]) });
});

router.post("/admin/logout", (req, res) => {
  if (!trustedBrowserRequest(req)) {
    res.status(403).json({ error: "Origjina e kërkesës nuk lejohet." });
    return;
  }

  destroySession(req.cookies?.[COOKIE_NAME]);
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.setHeader("Cache-Control", "no-store");
  req.log?.info({ event: "admin_logout" }, "Admin logout");
  res.json({ ok: true });
});

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  if (!trustedBrowserRequest(req)) {
    res.status(403).json({ error: "Origjina e kërkesës nuk lejohet." });
    return;
  }
  if (!authConfigurationReady()) {
    res.status(503).json({ error: "Hyrja administrative nuk është konfiguruar në server." });
    return;
  }
  if (!hasValidSession(req.cookies?.[COOKIE_NAME])) {
    res.status(401).json({ error: "Ju lutemi hyni përsëri në panel." });
    return;
  }
  next();
}

export default router;
