import type { AiEvaluation, AiScore, JobApplication, JobStatus, TimelineEvent } from "@/lib/db-types";
import { createId, query, withTransaction } from "@/lib/db";
import { timed } from "@/lib/observability";

function parseDate(v: unknown): Date {
  if (v instanceof Date) return v;
  return new Date(String(v));
}

export function jobRowToApplication(row: Record<string, unknown>): JobApplication {
  return {
    id: String(row.id),
    company: String(row.company),
    position: String(row.position),
    location: row.location != null ? String(row.location) : null,
    salaryMin: row.salaryMin != null ? Number(row.salaryMin) : null,
    salaryMax: row.salaryMax != null ? Number(row.salaryMax) : null,
    jobUrl: row.jobUrl != null ? String(row.jobUrl) : null,
    description: row.description != null ? String(row.description) : null,
    notes: row.notes != null ? String(row.notes) : null,
    status: row.status as JobStatus,
    appliedAt: parseDate(row.appliedAt),
    updatedAt: parseDate(row.updatedAt),
    userId: String(row.userId),
    aiScore: (row.aiScore as AiScore | null) ?? null,
    offerBase: row.offerBase != null ? Number(row.offerBase) : null,
    offerEquity: row.offerEquity != null ? String(row.offerEquity) : null,
    offerBonus: row.offerBonus != null ? Number(row.offerBonus) : null,
    offerBenefits: row.offerBenefits != null ? String(row.offerBenefits) : null,
    offerStartDate: row.offerStartDate != null ? parseDate(row.offerStartDate) : null,
    offerExpiresAt: row.offerExpiresAt != null ? parseDate(row.offerExpiresAt) : null,
  };
}

function parseAiEvaluationJson(j: Record<string, unknown> | null): AiEvaluation | null {
  if (!j || typeof j !== "object") return null;
  return {
    id: String(j.id),
    jobApplicationId: String(j.jobApplicationId),
    score: j.score as AiScore,
    scoreNumeric: Number(j.scoreNumeric),
    summary: String(j.summary),
    cvMatchPercent: j.cvMatchPercent != null ? Number(j.cvMatchPercent) : null,
    keyGaps: Array.isArray(j.keyGaps) ? (j.keyGaps as string[]) : [],
    keyStrengths: Array.isArray(j.keyStrengths) ? (j.keyStrengths as string[]) : [],
    compensationSignal: j.compensationSignal != null ? String(j.compensationSignal) : null,
    fullReport: (typeof j.fullReport === "object" && j.fullReport !== null ? j.fullReport : {}) as Record<string, unknown>,
    companyResearch: j.companyResearch as AiEvaluation["companyResearch"],
    personalizationPlan: j.personalizationPlan as AiEvaluation["personalizationPlan"],
    modelUsed: String(j.modelUsed),
    promptVersion: Number(j.promptVersion ?? 1),
    generatedAt: parseDate(j.generatedAt),
    expiresAt: j.expiresAt != null ? parseDate(j.expiresAt) : null,
  };
}

export type JobWithRelations = JobApplication & {
  timeline: TimelineEvent[];
  aiEvaluation: AiEvaluation | null;
};

export type ListJobsFilters = {
  userId: string;
  status?: JobStatus;
  search?: string;
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  sort?: string;
  page?: number;
  limit?: number;
};

const ORDER_SQL: Record<string, string> = {
  "date-desc": `"updatedAt" DESC`,
  "date-asc": `"updatedAt" ASC`,
  "company-asc": `"company" ASC`,
  "company-desc": `"company" DESC`,
  "salary-desc": `"salaryMax" DESC NULLS LAST`,
  "salary-asc": `"salaryMin" ASC NULLS LAST`,
  "location-asc": `"location" ASC NULLS LAST`,
  "location-desc": `"location" DESC NULLS LAST`,
};

function buildFilterSql(startIdx: number, f: Omit<ListJobsFilters, "sort" | "page" | "limit">): { sql: string; params: any[]; next: number } {
  const params: any[] = [];
  let i = startIdx;
  const parts: string[] = [];

  parts.push(`"userId" = $${i}`);
  params.push(f.userId);
  i += 1;

  if (f.status) {
    parts.push(`"status" = $${i}::"JobStatus"`);
    params.push(f.status);
    i += 1;
  }
  if (f.search?.trim()) {
    const term = `%${f.search.trim()}%`;
    parts.push(`(LOWER("company") LIKE LOWER($${i}) OR LOWER("position") LIKE LOWER($${i + 1}))`);
    params.push(term, term);
    i += 2;
  }
  if (f.location?.trim()) {
    parts.push(`LOWER("location") LIKE LOWER($${i})`);
    params.push(`%${f.location.trim()}%`);
    i += 1;
  }
  if (f.minSalary != null) {
    parts.push(`"salaryMax" >= $${i}`);
    params.push(f.minSalary);
    i += 1;
  }
  if (f.maxSalary != null) {
    parts.push(`"salaryMin" <= $${i}`);
    params.push(f.maxSalary);
    i += 1;
  }

  return { sql: parts.join(" AND "), params, next: i };
}

/**
 * Single round-trip: page of jobs + total count (explicit SQL, indexed filters).
 */
export async function listJobsWithTotal(filters: ListJobsFilters) {
  const { sort = "date-desc", page = 1, limit = 12, ...filterOnly } = filters;
  const skip = (page - 1) * limit;
  const orderSql = ORDER_SQL[sort] ?? ORDER_SQL["date-desc"];

  const { sql: whereSql, params: whereParams, next } = buildFilterSql(1, filterOnly);
  const limitIdx = next;
  const offsetIdx = next + 1;

  const sql = `
    SELECT j.*, t.total::int AS "__total"
    FROM (
      SELECT * FROM "JobApplication"
      WHERE ${whereSql}
      ORDER BY ${orderSql}
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    ) j
    CROSS JOIN (
      SELECT COUNT(*)::int AS total FROM "JobApplication" WHERE ${whereSql}
    ) t
  `;

  return timed("listJobsWithTotal", () =>
    query<Record<string, unknown> & { __total: number }>(sql, [...whereParams, limit, skip])
  );
}

/** Normalize rows from listJobsWithTotal (strip __total from each row — same total on every row). */
export function splitListResult(rows: Array<Record<string, unknown> & { __total?: number }>) {
  if (!rows.length) {
    return { jobs: [] as JobApplication[], total: 0 };
  }
  const total = Number(rows[0].__total ?? 0);
  const jobs = rows.map(({ __total: _t, ...job }) => jobRowToApplication(job));
  return { jobs, total };
}

/**
 * One round-trip: job + timeline JSON + AI evaluation JSON.
 */
export async function getJobByIdWithRelations(jobId: string, userId: string): Promise<JobWithRelations | null> {
  const rows = await timed("getJobByIdWithRelations", () =>
    query<Record<string, unknown> & { timeline: unknown; aiEvaluation: Record<string, unknown> | null }>(
      `
      SELECT j.*,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', te.id,
                'eventType', te."eventType",
                'description', te.description,
                'eventDate', te."eventDate",
                'jobApplicationId', te."jobApplicationId"
              ) ORDER BY te."eventDate" DESC
            )
            FROM "TimelineEvent" te
            WHERE te."jobApplicationId" = j.id
          ),
          '[]'::json
        ) AS timeline,
        (
          SELECT to_jsonb(ae)
          FROM "AiEvaluation" ae
          WHERE ae."jobApplicationId" = j.id
          LIMIT 1
        ) AS "aiEvaluation"
      FROM "JobApplication" j
      WHERE j.id = $1 AND j."userId" = $2
      LIMIT 1
      `,
      [jobId, userId]
    )
  );

  const row = rows[0];
  if (!row) return null;

  const timelineRaw = row.timeline;
  const timelineParsed: TimelineEvent[] = [];
  if (Array.isArray(timelineRaw)) {
    for (const ev of timelineRaw) {
      if (!ev || typeof ev !== "object") continue;
      const e = ev as Record<string, unknown>;
      timelineParsed.push({
        id: String(e.id),
        eventType: String(e.eventType),
        description: e.description != null ? String(e.description) : null,
        eventDate: e.eventDate instanceof Date ? e.eventDate : new Date(String(e.eventDate)),
        jobApplicationId: String(e.jobApplicationId),
      });
    }
  }

  const { timeline: _tl, aiEvaluation: _ae, ...jobRest } = row;
  const base = jobRowToApplication(jobRest);

  const aiEval =
    row.aiEvaluation && typeof row.aiEvaluation === "object"
      ? parseAiEvaluationJson(row.aiEvaluation as Record<string, unknown>)
      : null;

  return {
    ...base,
    timeline: timelineParsed,
    aiEvaluation: aiEval,
  };
}

/** Atomic status update + timeline row (real SQL transaction). */
export async function updateJobStatusTransactional(
  jobId: string,
  userId: string,
  newStatus: JobStatus,
  timelineDescription: string
) {
  const eventId = createId();
  await withTransaction(async (client) => {
    const upd = await query(
      `
      UPDATE "JobApplication"
      SET "status" = $1::"JobStatus", "updatedAt" = NOW()
      WHERE "id" = $2 AND "userId" = $3
      RETURNING id
      `,
      [newStatus, jobId, userId],
      client
    );
    if (!upd.length) {
      throw new Error("Job not found or unauthorized");
    }
    await query(
      `
      INSERT INTO "TimelineEvent" ("id", "eventType", "description", "eventDate", "jobApplicationId")
      VALUES ($1, $2, $3, NOW(), $4)
      `,
      [eventId, "STATUS_CHANGE", timelineDescription, jobId],
      client
    );
  });
}
