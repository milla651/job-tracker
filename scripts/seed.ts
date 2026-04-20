#!/usr/bin/env tsx
/**
 * Seeds the database with the super-admin account.
 * Uses ON CONFLICT DO UPDATE — safe to re-run.
 */

import fs from "node:fs";
import path from "node:path";
import { Pool, type PoolConfig } from "pg";
import bcrypt from "bcryptjs";

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

const ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? "benkim388@gmail.com";
const ADMIN_NAME = process.env.SUPER_ADMIN_NAME ?? "Swift Kimani";
const ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? "ChangeThisNow!2026";

function parseDbUrl(rawUrl: string): PoolConfig {
  try {
    const parsed = new URL(rawUrl);
    const sslMode = parsed.searchParams.get("sslmode") ?? "";
    parsed.searchParams.delete("sslmode");
    const isLocal = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
    const ssl =
      sslMode === "disable" || isLocal ? false : { rejectUnauthorized: false };
    return { connectionString: parsed.toString(), ssl, connectionTimeoutMillis: 15_000 };
  } catch {
    return { connectionString: rawUrl, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15_000 };
  }
}

async function main() {
  const pool = new Pool(parseDbUrl(dbUrl!));
  try {
    const adminId = "usr_swift_admin_001";
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await pool.query(
      `INSERT INTO "User" (id, email, name, password, "emailVerified", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
       ON CONFLICT (id) DO UPDATE
         SET email           = EXCLUDED.email,
             name            = EXCLUDED.name,
             password        = EXCLUDED.password,
             "emailVerified" = NOW(),
             "updatedAt"     = NOW()`,
      [adminId, ADMIN_EMAIL, ADMIN_NAME, hashedPassword]
    );

    console.log(
      `[db:seed] Super admin upserted — id: ${adminId}, email: ${ADMIN_EMAIL} ✓`
    );
    console.log(
      `[db:seed] ⚠️  Update SUPER_ADMIN_PASSWORD in .env before production deploy!`
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[db:seed] Error:", err.message);
  process.exit(1);
});
