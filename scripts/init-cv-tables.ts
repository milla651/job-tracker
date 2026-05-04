#!/usr/bin/env tsx
/**
 * Applies CV tables migration to the database.
 * Safe to run multiple times (uses CREATE TABLE IF NOT EXISTS).
 */

import fs from "node:fs";
import path from "node:path";
import { Pool, type PoolConfig } from "pg";

function loadEnv() {
  const files = [".env.local", ".env"];
  for (const file of files) {
    const fp = path.join(process.cwd(), file);
    if (!fs.existsSync(fp)) continue;
    const lines = fs.readFileSync(fp, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}
loadEnv();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) throw new Error("DATABASE_URL environment variable is not set.");

function parseDbUrl(rawUrl: string): PoolConfig {
  try {
    const parsed = new URL(rawUrl);
    const sslMode = parsed.searchParams.get("sslmode") ?? "";
    parsed.searchParams.delete("sslmode");
    const isLocal = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
    const ssl = sslMode === "disable" || isLocal ? false : { rejectUnauthorized: false };
    return { connectionString: parsed.toString(), ssl, connectionTimeoutMillis: 20_000 };
  } catch {
    return {
      connectionString: rawUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 20_000,
    };
  }
}

async function main() {
  const migrationPath = path.join(process.cwd(), "db", "migrations", "0005_cv_data_models.sql");
  
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }
  
  const sql = fs.readFileSync(migrationPath, "utf8");
  const pool = new Pool(parseDbUrl(dbUrl!));

  for (let attempt = 1; attempt <= 3; attempt++) {
    let client;
    try {
      client = await pool.connect();
      await client.query(sql);
      console.log("[cv-tables:init] CV data tables applied successfully ✓");
      await pool.end();
      return;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt < 3) {
        console.warn(`[cv-tables:init] Attempt ${attempt} failed (${msg}), retrying...`);
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        throw err;
      }
    } finally {
      if (client) client.release();
    }
  }
}

main().catch((err) => {
  console.error("[cv-tables:init] Error:", err.message);
  process.exit(1);
});
