import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

let publishingTablesPromise: Promise<void> | undefined;

export function ensurePublishingTables(): Promise<void> {
  publishingTablesPromise ??= pool
    .query(`
      CREATE TABLE IF NOT EXISTS admin_news (
        id BIGINT PRIMARY KEY,
        slug TEXT NOT NULL,
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        published_at TIMESTAMPTZ NOT NULL,
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        duration TEXT NOT NULL DEFAULT '1w',
        expires_at TIMESTAMPTZ
      );
      ALTER TABLE admin_news ADD COLUMN IF NOT EXISTS popup BOOLEAN NOT NULL DEFAULT FALSE;
      ALTER TABLE admin_news ADD COLUMN IF NOT EXISTS duration TEXT NOT NULL DEFAULT '1w';
      ALTER TABLE admin_news ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
      UPDATE admin_news
      SET expires_at = published_at + CASE
        WHEN popup THEN INTERVAL '24 hours'
        WHEN duration = '6h' THEN INTERVAL '6 hours'
        WHEN duration = '24h' THEN INTERVAL '24 hours'
        WHEN duration = '3d' THEN INTERVAL '3 days'
        ELSE INTERVAL '7 days'
      END
      WHERE expires_at IS NULL;
      CREATE INDEX IF NOT EXISTS admin_news_published_at_idx ON admin_news (published_at DESC);

      CREATE TABLE IF NOT EXISTS admin_events (
        id BIGINT PRIMARY KEY,
        date TEXT NOT NULL,
        month TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        time TEXT,
        location TEXT,
        type TEXT NOT NULL,
        highlight BOOLEAN NOT NULL DEFAULT FALSE,
        period TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS admin_events_period_idx ON admin_events (period);
    `)
    .then(() => undefined);

  return publishingTablesPromise;
}

export * from "./schema";
