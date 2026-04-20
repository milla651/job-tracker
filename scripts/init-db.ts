#!/usr/bin/env tsx
/**
 * Applies db/schema.sql to the target database.
 * Uses CREATE TABLE IF NOT EXISTS throughout — safe to re-run.
 */

import fs from "node:fs";
import path from "node:path";
import { Pool, type PoolConfig } from "pg";

// Load .env.local first, then .env
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
    const isLocal = ["localhost", "127.0.0.1", "::1"].includes(
      parsed.hostname
    );
    const ssl =
      sslMode === "disable" || isLocal
        ? false
        : { rejectUnauthorized: false };
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
  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }
  const sql = fs.readFileSync(schemaPath, "utf8");
  const pool = new Pool(parseDbUrl(dbUrl!));

  // Retry up to 3 times to handle transient VPS connection issues
  for (let attempt = 1; attempt <= 3; attempt++) {
    let client;
    try {
      client = await pool.connect();
      await client.query(sql);
      console.log("[db:init] Schema applied successfully ✓");
      return;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt < 3) {
        console.warn(`[db:init] Attempt ${attempt} failed (${msg}), retrying...`);
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
  console.error("[db:init] Error:", err.message);
  process.exit(1);
});
