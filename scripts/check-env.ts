#!/usr/bin/env tsx
/**
 * Validates required environment variables and tests the database connection.
 * Run before deploying: npm run db:check
 */

import path from "node:path";
import fs from "node:fs";
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

// App will not start without these
const REQUIRED = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXT_PUBLIC_APP_URL",
];

// Needed for specific features; warn but don't fail
const FEATURE_KEYS = [
  "RESEND_API_KEY",
  "ANTHROPIC_API_KEY",
  "CRON_SECRET",
  "PDF_SERVICE_URL",
  "PDF_SERVICE_SECRET",
];

const OPTIONAL = [
  "ENABLE_AI_EVALUATION",
  "ENABLE_PORTAL_SCANNING",
  "ENABLE_RESUME_GENERATION",
  "AI_DAILY_CALL_LIMIT",
];

function parseDbUrl(rawUrl: string): PoolConfig {
  try {
    const parsed = new URL(rawUrl);
    const sslMode = parsed.searchParams.get("sslmode") ?? "";
    parsed.searchParams.delete("sslmode");
    const isLocal = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
    const ssl =
      sslMode === "disable" || isLocal ? false : { rejectUnauthorized: false };
    return { connectionString: parsed.toString(), ssl, connectionTimeoutMillis: 20_000 };
  } catch {
    return { connectionString: rawUrl, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 20_000 };
  }
}

async function main() {
  let hasErrors = false;

  console.log("\n── Required variables ──────────────────────────");
  for (const key of REQUIRED) {
    const val = process.env[key];
    if (!val) {
      console.error(`  ✗  ${key} — MISSING`);
      hasErrors = true;
    } else {
      const masked = val.length > 12 ? `${val.slice(0, 8)}…` : "***";
      console.log(`  ✓  ${key} = ${masked}`);
    }
  }

  console.log("\n── Feature variables ───────────────────────────");
  for (const key of FEATURE_KEYS) {
    const val = process.env[key];
    console.log(`  ${val ? "✓" : "⚠"}  ${key} = ${val ? "set" : "not set (feature disabled)"}`);
  }

  console.log("\n── Optional variables ──────────────────────────");
  for (const key of OPTIONAL) {
    const val = process.env[key];
    console.log(`  ${val ? "✓" : "○"}  ${key} = ${val ? "set" : "not set"}`);
  }

  if (hasErrors) {
    console.error("\n[db:check] ✗  Fix missing required variables before deploying.\n");
    process.exit(1);
  }

  console.log("\n── Database connection ─────────────────────────");
  const pool = new Pool(parseDbUrl(process.env.DATABASE_URL!));
  // Retry once on transient connection errors
  let client = await pool.connect().catch(() => null);
  if (!client) {
    await new Promise((r) => setTimeout(r, 2000));
    client = await pool.connect().catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗  Connection failed: ${msg}`);
      hasErrors = true;
      return null;
    });
  }
  if (client) {
    try {
      const start = Date.now();
      const res = await client.query(
        `SELECT current_database() AS db, version() AS ver,
         (SELECT COUNT(*)::int FROM information_schema.tables
          WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS tables`
      );
      const row = res.rows[0];
      const ms = Date.now() - start;
      console.log(`  ✓  Connected to: ${row.db}`);
      console.log(`  ✓  Tables found: ${row.tables}`);
      console.log(`  ✓  Latency: ${ms}ms`);
      if (Number(row.tables) === 0) {
        console.warn("  ⚠️  No tables found — run: npm run db:init");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗  Query failed: ${msg}`);
      hasErrors = true;
    } finally {
      client.release();
    }
  }
  await pool.end();

  if (hasErrors) {
    console.error("\n[db:check] ✗  Checks failed.\n");
    process.exit(1);
  }

  console.log("\n[db:check] ✓  All checks passed — ready to deploy.\n");
}

main().catch((err) => {
  console.error("[db:check] Error:", err.message);
  process.exit(1);
});
