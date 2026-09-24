const configuredOrigins = new Set(
  (process.env.REPLIT_DOMAINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value.includes("://") ? value : `https://${value}`).origin;
      } catch {
        return "";
      }
    })
    .filter(Boolean),
);

export function isAllowedOrigin(origin: string): boolean {
  if (configuredOrigins.has(origin)) return true;
  if (process.env.NODE_ENV === "production") return false;

  try {
    const parsed = new URL(origin);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}