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
        featured BOOLEAN NOT NULL DEFAULT FALSE
      );
      ALTER TABLE admin_news ADD COLUMN IF NOT EXISTS popup BOOLEAN NOT NULL DEFAULT FALSE;
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
