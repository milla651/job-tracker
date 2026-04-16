import { Pool, PoolClient } from "pg";
import type { JobStatus } from "@/lib/db-types";

type Queryable = Pool | PoolClient;

const globalForDb = globalThis as unknown as {
  pgPool?: Pool;
};

const poolMax = Math.min(50, Math.max(2, parseInt(process.env.PG_POOL_MAX ?? "12", 10)));
const poolIdleMs = parseInt(process.env.PG_IDLE_TIMEOUT_MS ?? "30000", 10);
const poolConnTimeoutMs = parseInt(process.env.PG_CONNECTION_TIMEOUT_MS ?? "10000", 10);

const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: poolMax,
    idleTimeoutMillis: poolIdleMs,
    connectionTimeoutMillis: poolConnTimeoutMs,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
}

/** Parameterized query; pass a PoolClient from {@link withTransaction} for real transactions. */
export async function query<T = any>(
  sql: string,
  params: any[] = [],
  db: Queryable = pool
): Promise<T[]> {
  const result = await db.query(sql, params);
  return result.rows as T[];
}

const runQuery = query;

export const createId = () => crypto.randomUUID().replace(/-/g, "");

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const out = await fn(client);
    await client.query("COMMIT");
    return out;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

const normalizeRow = <T extends Record<string, any>>(row: T): T => {
  const next: Record<string, any> = { ...row };
  if ("content" in next && Buffer.isBuffer(next.content)) {
    next.content = new Uint8Array(next.content);
  }
  return next as T;
};

type Where = Record<string, any> | undefined;

const buildWhere = (where?: Where, startAt = 1): { clause: string; params: any[]; next: number } => {
  if (!where || Object.keys(where).length === 0) {
    return { clause: "", params: [], next: startAt };
  }

  let idx = startAt;
  const params: any[] = [];
  const parts: string[] = [];

  const addCondition = (key: string, value: any) => {
    if (value === undefined) return;
    if (key === "OR" && Array.isArray(value)) {
      const orParts = value
        .map((entry) => {
          const built = buildWhere(entry, idx);
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
          const built = buildWhere(entry, idx);
          idx = built.next;
          params.push(...built.params);
          return built.clause.replace(/^WHERE /, "");
        })
        .filter(Boolean);
      if (andParts.length) parts.push(`(${andParts.join(" AND ")})`);
      return;
    }

    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      if ("notIn" in value && Array.isArray((value as { notIn: unknown }).notIn)) {
        const arr = (value as { notIn: string[] }).notIn;
        parts.push(`NOT ("${key}"::text = ANY($${idx}::text[]))`);
        params.push(arr);
        idx += 1;
        return;
      }
      if ("contains" in value) {
        const needle = value.mode === "insensitive" ? `%${String(value.contains).toLowerCase()}%` : `%${value.contains}%`;
        const expr = value.mode === "insensitive" ? `LOWER("${key}") LIKE $${idx}` : `"${key}" LIKE $${idx}`;
        parts.push(expr);
        params.push(needle);
        idx += 1;
        return;
      }
      if ("in" in value) {
        parts.push(`"${key}" = ANY($${idx})`);
        params.push(value.in);
        idx += 1;
        return;
      }
      if ("not" in value) {
        parts.push(`"${key}" <> $${idx}`);
        params.push(value.not);
        idx += 1;
        return;
      }
      if ("gte" in value) {
        parts.push(`"${key}" >= $${idx}`);
        params.push(value.gte);
        idx += 1;
      }
      if ("lte" in value) {
        parts.push(`"${key}" <= $${idx}`);
        params.push(value.lte);
        idx += 1;
      }
      if ("increment" in value) {
        return;
      }
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
  return `ORDER BY "${key}" ${String(direction).toUpperCase() === "ASC" ? "ASC" : "DESC"}`;
};

const buildUpdateSet = (data: Record<string, any>, startAt: number) => {
  const setParts: string[] = [];
  const params: any[] = [];
  let idx = startAt;

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value && typeof value === "object" && "increment" in value) {
      setParts.push(`"${key}" = "${key}" + $${idx}`);
      params.push(value.increment);
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
      `INSERT INTO "${table}" (${keys.map((k) => `"${k}"`).join(", ")}) VALUES (${placeholders}) RETURNING *`,
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
    const rows = await runQuery<any>(`DELETE FROM "${table}" ${whereBuilt.clause} RETURNING *`, whereBuilt.params);
    return rows[0] ? normalizeRow(rows[0]) : null;
  },
  async deleteMany({ where }: any) {
    const whereBuilt = buildWhere(where);
    const rows = await runQuery<any>(`DELETE FROM "${table}" ${whereBuilt.clause} RETURNING "id"`, whereBuilt.params);
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

async function insertRow(client: PoolClient, table: string, data: Record<string, any>) {
  const nextData = { ...data };
  if (!nextData.id) nextData.id = createId();
  const keys = Object.keys(nextData);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const rows = await query<any>(
    `INSERT INTO "${table}" (${keys.map((k) => `"${k}"`).join(", ")}) VALUES (${placeholders}) RETURNING *`,
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
        job.aiEvaluation = await db.aiEvaluation.findUnique({ where: { jobApplicationId: job.id } });
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
      return rows.map((row) => ({ status: row.status, _count: { status: Number(row.count) } }));
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
