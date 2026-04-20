import { Pool, PoolClient, type PoolConfig } from "pg";
import type { JobStatus } from "@/lib/db-types";

type Queryable = Pool | PoolClient;

function buildPoolConfig(rawUrl: string): PoolConfig {
  let connectionString = rawUrl;
  let ssl: PoolConfig["ssl"] = { rejectUnauthorized: false };

  try {
    const parsed = new URL(rawUrl);
    // pg v8+ maps sslmode=require → verify-full, which rejects self-signed certs.
    // Strip the param and manage SSL directly via the ssl object instead.
    const sslMode = (
      process.env.DB_SSL_MODE ??
      parsed.searchParams.get("sslmode") ??
      ""
    ).toLowerCase();
    parsed.searchParams.delete("sslmode");
    parsed.searchParams.delete("uselibpqcompat");
    connectionString = parsed.toString();

    const isLocal = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
    if (sslMode === "disable" || isLocal) ssl = false;
    // All remote hosts: rejectUnauthorized:false accepts self-signed/snakeoil certs
  } catch {
    connectionString = rawUrl;
  }

  const poolMax = Math.min(
    50,
    Math.max(2, parseInt(process.env.PG_POOL_MAX ?? "5", 10))
  );

  return {
    connectionString,
    ssl,
    max: poolMax,
    idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT_MS ?? "15000", 10),
    connectionTimeoutMillis: parseInt(
      process.env.PG_CONNECTION_TIMEOUT_MS ?? "20000",
      10
    ),
  };
}

// Lazy pool — survives Next.js HMR without spawning duplicate connections
const g = globalThis as unknown as { pgPool?: Pool; pgPoolUrl?: string };

function getPool(): Pool {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error('Define "DATABASE_URL" environment variable.');

  if (g.pgPool && g.pgPoolUrl === dbUrl) return g.pgPool;
  if (g.pgPool) g.pgPool.end().catch(() => {});

  const pool = new Pool(buildPoolConfig(dbUrl));
  pool.on("error", (err) =>
    console.warn("[DB] Idle client error:", err.message)
  );
  g.pgPool = pool;
  g.pgPoolUrl = dbUrl;
  return pool;
}

// Transient errors that warrant one automatic retry
const RETRYABLE = [
  "Connection terminated",
  "Connection ended unexpectedly",
  "connection timeout",
  "ETIMEDOUT",
];

/** Execute a parameterized query with automatic retry on transient errors. */
export async function query<T = any>(
  sql: string,
  params: unknown[] = [],
  db?: Queryable
): Promise<T[]> {
  if (db) {
    const result = await db.query(sql, params);
    return result.rows as T[];
  }

  const pool = getPool();
  let lastErr: unknown;

  for (let attempt = 0; attempt <= 1; attempt++) {
    let client: PoolClient | undefined;
    try {
      client = await pool.connect();
      const result = await client.query(sql, params);
      return result.rows as T[];
    } catch (err: unknown) {
      lastErr = err;
      if (client) {
        client.release(true);
        client = undefined;
      }
      const msg = err instanceof Error ? err.message : "";
      const isTransient = RETRYABLE.some((s) => msg.includes(s));
      if (attempt === 0 && isTransient) {
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw err;
    } finally {
      if (client) client.release();
    }
  }
  throw lastErr;
}

const runQuery = query;

export const createId = () => crypto.randomUUID().replace(/-/g, "");

/** Run multiple queries inside a single atomic transaction. */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const out = await fn(client);
    await client.query("COMMIT");
    return out;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}

const normalizeRow = <T extends Record<string, unknown>>(row: T): T => {
  const next: Record<string, unknown> = { ...row };
  if ("content" in next && Buffer.isBuffer(next.content)) {
    next.content = new Uint8Array(next.content as Buffer);
  }
  return next as T;
};

type Where = Record<string, unknown> | undefined;

const buildWhere = (
  where?: Where,
  startAt = 1
): { clause: string; params: unknown[]; next: number } => {
  if (!where || Object.keys(where).length === 0) {
    return { clause: "", params: [], next: startAt };
  }

  let idx = startAt;
  const params: unknown[] = [];
  const parts: string[] = [];

  const addCondition = (key: string, value: unknown) => {
    if (value === undefined) return;
    if (key === "OR" && Array.isArray(value)) {
      const orParts = value
        .map((entry) => {
          const built = buildWhere(entry as Where, idx);
          idx = built.next;
          params.push(...built.params);
          return built.clause.replace(/^WHERE /, "");
        })
        .filter(Boolean);
      if (orParts.length) parts.push(`(${orParts.join(" OR ")})`);
      return;
    }
    if (key === "AND" && Array.isArray(value)) {
      const andParts = value
        .map((entry) => {
          const built = buildWhere(entry as Where, idx);
          idx = built.next;
          params.push(...built.params);
          return built.clause.replace(/^WHERE /, "");
        })
        .filter(Boolean);
      if (andParts.length) parts.push(`(${andParts.join(" AND ")})`);
      return;
    }

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      const v = value as Record<string, unknown>;
      if ("notIn" in v && Array.isArray(v.notIn)) {
        parts.push(`NOT ("${key}"::text = ANY($${idx}::text[]))`);
        params.push(v.notIn);
        idx += 1;
        return;
      }
      if ("contains" in v) {
        const needle =
          v.mode === "insensitive"
            ? `%${String(v.contains).toLowerCase()}%`
            : `%${v.contains}%`;
        const expr =
          v.mode === "insensitive"
            ? `LOWER("${key}") LIKE $${idx}`
            : `"${key}" LIKE $${idx}`;
        parts.push(expr);
        params.push(needle);
        idx += 1;
        return;
      }
      if ("in" in v) {
        parts.push(`"${key}" = ANY($${idx})`);
        params.push(v.in);
        idx += 1;
        return;
      }
      if ("not" in v) {
        parts.push(`"${key}" <> $${idx}`);
        params.push(v.not);
        idx += 1;
        return;
      }
      if ("gte" in v) {
        parts.push(`"${key}" >= $${idx}`);
        params.push(v.gte);
        idx += 1;
      }
      if ("lte" in v) {
        parts.push(`"${key}" <= $${idx}`);
        params.push(v.lte);
        idx += 1;
      }
      if ("increment" in v) return;
      return;
    }

    parts.push(`"${key}" = $${idx}`);
    params.push(value);
    idx += 1;
  };

  Object.entries(where).forEach(([key, value]) => addCondition(key, value));
  if (!parts.length) return { clause: "", params: [], next: idx };
  return { clause: `WHERE ${parts.join(" AND ")}`, params, next: idx };
};

const buildOrderBy = (orderBy?: Record<string, "asc" | "desc">) => {
  if (!orderBy) return "";
  const [key, direction] = Object.entries(orderBy)[0] ?? [];
  if (!key) return "";
  return `ORDER BY "${key}" ${
    String(direction).toUpperCase() === "ASC" ? "ASC" : "DESC"
  }`;
};

const buildUpdateSet = (data: Record<string, unknown>, startAt: number) => {
  const setParts: string[] = [];
  const params: unknown[] = [];
  let idx = startAt;

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;
    if (
      value &&
      typeof value === "object" &&
      "increment" in (value as Record<string, unknown>)
    ) {
      setParts.push(`"${key}" = "${key}" + $${idx}`);
      params.push((value as { increment: number }).increment);
      idx += 1;
      return;
    }
    setParts.push(`"${key}" = $${idx}`);
    params.push(value);
    idx += 1;
  });

  return { setClause: setParts.join(", "), params, next: idx };
};

const basicModel = (table: string) => ({
  async findUnique({ where, select, include }: any) {
    const rows = await this.findMany({ where, take: 1, select, include });
    return rows[0] ?? null;
  },
  async findFirst({ where, orderBy, select }: any) {
    const rows = await this.findMany({ where, orderBy, take: 1, select });
    return rows[0] ?? null;
  },
  async findMany({ where, orderBy, skip, take, select }: any = {}) {
    const whereBuilt = buildWhere(where);
    const orderClause = buildOrderBy(orderBy);
    const selectClause =
      select && Object.keys(select).length
        ? Object.entries(select)
            .filter(([, enabled]) => Boolean(enabled))
            .map(([k]) => `"${k}"`)
            .join(", ")
        : "*";
    const limitClause = typeof take === "number" ? `LIMIT ${take}` : "";
    const offsetClause = typeof skip === "number" ? `OFFSET ${skip}` : "";
    const rows = await runQuery<any>(
      `SELECT ${selectClause} FROM "${table}" ${whereBuilt.clause} ${orderClause} ${limitClause} ${offsetClause}`,
      whereBuilt.params
    );
    return rows.map(normalizeRow);
  },
  async create({ data }: any) {
    const nextData = { ...data };
    if (!nextData.id) nextData.id = createId();
    const keys = Object.keys(nextData);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const rows = await runQuery<any>(
      `INSERT INTO "${table}" (${keys
        .map((k) => `"${k}"`)
        .join(", ")}) VALUES (${placeholders}) RETURNING *`,
      keys.map((k) => nextData[k])
    );
    return normalizeRow(rows[0]);
  },
  async update({ where, data }: any) {
    const whereBuilt = buildWhere(where);
    const setBuilt = buildUpdateSet(data, whereBuilt.next);
    const rows = await runQuery<any>(
      `UPDATE "${table}" SET ${setBuilt.setClause} ${whereBuilt.clause} RETURNING *`,
      [...setBuilt.params, ...whereBuilt.params]
    );
    return rows[0] ? normalizeRow(rows[0]) : null;
  },
  async updateMany({ where, data }: any) {
    const whereBuilt = buildWhere(where);
    const setBuilt = buildUpdateSet(data, whereBuilt.next);
    const rows = await runQuery<any>(
      `UPDATE "${table}" SET ${setBuilt.setClause} ${whereBuilt.clause} RETURNING "id"`,
      [...setBuilt.params, ...whereBuilt.params]
    );
    return { count: rows.length };
  },
  async delete({ where }: any) {
    const whereBuilt = buildWhere(where);
    const rows = await runQuery<any>(
      `DELETE FROM "${table}" ${whereBuilt.clause} RETURNING *`,
      whereBuilt.params
    );
    return rows[0] ? normalizeRow(rows[0]) : null;
  },
  async deleteMany({ where }: any) {
    const whereBuilt = buildWhere(where);
    const rows = await runQuery<any>(
      `DELETE FROM "${table}" ${whereBuilt.clause} RETURNING "id"`,
      whereBuilt.params
    );
    return { count: rows.length };
  },
  async upsert({ where, create, update }: any) {
    const existing = await this.findUnique({ where });
    if (existing) return this.update({ where, data: update });
    return this.create({ data: create });
  },
  async count({ where }: any = {}) {
    const whereBuilt = buildWhere(where);
    const rows = await runQuery<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM "${table}" ${whereBuilt.clause}`,
      whereBuilt.params
    );
    return Number(rows[0]?.count ?? 0);
  },
});

const jobApplicationBase = basicModel("JobApplication");

async function insertRow(
  client: PoolClient,
  table: string,
  data: Record<string, unknown>
) {
  const nextData = { ...data };
  if (!nextData.id) nextData.id = createId();
  const keys = Object.keys(nextData);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const rows = await query<any>(
    `INSERT INTO "${table}" (${keys
      .map((k) => `"${k}"`)
      .join(", ")}) VALUES (${placeholders}) RETURNING *`,
    keys.map((k) => nextData[k]),
    client
  );
  return normalizeRow(rows[0]);
}

export const db = {
  user: basicModel("User"),
  userProfile: basicModel("UserProfile"),
  verificationToken: basicModel("VerificationToken"),
  passwordResetToken: basicModel("PasswordResetToken"),
  timelineEvent: basicModel("TimelineEvent"),
  document: basicModel("Document"),
  storyBankEntry: basicModel("StoryBankEntry"),
  aiEvaluation: basicModel("AiEvaluation"),
  interviewPrepPackage: basicModel("InterviewPrepPackage"),
  discoveredJob: basicModel("DiscoveredJob"),
  jobApplication: {
    ...jobApplicationBase,
    async create({ data }: any) {
      const timelineData = data?.timeline?.create;
      const payload = { ...data };
      delete payload.timeline;
      return withTransaction(async (client) => {
        const job = await insertRow(client, "JobApplication", payload);
        if (timelineData) {
          await insertRow(client, "TimelineEvent", {
            ...timelineData,
            id: createId(),
            jobApplicationId: job.id,
            eventDate: new Date(),
          });
        }
        return job;
      });
    },
    async findUnique({ where, include }: any) {
      const job = await jobApplicationBase.findUnique({ where });
      if (!job) return null;
      if (include?.timeline) {
        job.timeline = await db.timelineEvent.findMany({
          where: { jobApplicationId: job.id },
          orderBy: include.timeline.orderBy,
        });
      }
      if (include?.aiEvaluation) {
        job.aiEvaluation = await db.aiEvaluation.findUnique({
          where: { jobApplicationId: job.id },
        });
      }
      return job;
    },
    async groupBy({ by, where, _count }: any) {
      if (!Array.isArray(by) || by.length !== 1 || by[0] !== "status" || !_count?.status) {
        throw new Error("Only status groupBy is supported in Postgres adapter.");
      }
      const whereBuilt = buildWhere(where);
      const rows = await runQuery<{ status: JobStatus; count: number }>(
        `SELECT "status", COUNT(*)::int AS count FROM "JobApplication" ${whereBuilt.clause} GROUP BY "status"`,
        whereBuilt.params
      );
      return rows.map((row) => ({
        status: row.status,
        _count: { status: Number(row.count) },
      }));
    },
  },
  /**
   * Parallel execution (not a SQL transaction). Safe for independent reads.
   * For writes that must commit together, use {@link withTransaction}.
   */
  async $transaction(ops: Promise<any>[]) {
    return Promise.all(ops);
  },
};

export default db;
