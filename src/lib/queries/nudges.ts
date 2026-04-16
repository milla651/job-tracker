import type { JobStatus } from "@/lib/db-types";
import { query } from "@/lib/db";
import { timed } from "@/lib/observability";

export type NudgeJobRow = {
  id: string;
  position: string;
  company: string;
  updatedAt: Date;
  appliedAt: Date;
  status: JobStatus;
  aiScore: string | null;
  interviewPrepId: string | null;
};

/**
 * Jobs considered for smart nudges, with prep presence in one query (no N+1).
 */
export async function fetchJobsForNudges(userId: string): Promise<NudgeJobRow[]> {
  const rows = await timed("fetchJobsForNudges", () =>
    query<NudgeJobRow>(
      `
      SELECT
        j.id,
        j.position,
        j.company,
        j."updatedAt",
        j."appliedAt",
        j.status::text,
        j."aiScore"::text,
        ipp.id AS "interviewPrepId"
      FROM "JobApplication" j
      LEFT JOIN "InterviewPrepPackage" ipp ON ipp."jobApplicationId" = j.id
      WHERE j."userId" = $1
        AND NOT (j.status::text = ANY ($2::text[]))
      `,
      [userId, ["REJECTED", "WITHDRAWN", "OFFER", "ACCEPTED", "WISHLIST"]]
    )
  );
  return rows.map((r) => ({
    ...r,
    status: r.status as JobStatus,
    updatedAt: r.updatedAt instanceof Date ? r.updatedAt : new Date(String(r.updatedAt)),
    appliedAt: r.appliedAt instanceof Date ? r.appliedAt : new Date(String(r.appliedAt)),
  }));
}
