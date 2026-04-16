"use server";

import { auth } from "@/lib/auth";
import { JobStatus } from "@/lib/db-types";
import { differenceInDays } from "date-fns";
import { fetchJobsForNudges } from "@/lib/queries/nudges";

export type NudgeType =
  | "STALE"
  | "FOLLOW_UP"
  | "PREP_READY"
  | "PREP_PENDING"
  | "EVAL_READY";

export interface Nudge {
  id: string; // job id
  type: NudgeType;
  jobTitle: string;
  company: string;
  daysSinceUpdate: number;
  status: JobStatus;
  prepUrl?: string;
}

const INTERVIEW_STAGES: JobStatus[] = ["PHONE_SCREEN", "INTERVIEW", "TECHNICAL"];

export async function getSmartNudges(): Promise<Nudge[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const nudges: Nudge[] = [];
  const now = new Date();

  const jobs = await fetchJobsForNudges(session.user.id);

  for (const job of jobs) {
    const daysSinceUpdate = differenceInDays(now, job.updatedAt);
    const daysSinceApplied = differenceInDays(now, job.appliedAt);
    const isInterviewStage = INTERVIEW_STAGES.includes(job.status);

    // Rule 1: Stale Jobs (Active but no update for > 14 days)
    if (daysSinceUpdate > 14) {
      nudges.push({
        id: job.id,
        type: "STALE",
        jobTitle: job.position,
        company: job.company,
        daysSinceUpdate,
        status: job.status,
      });
      continue; // Don't double-count
    }

    // Rule 2: Follow-up (Applied > 7 days ago, still in APPLIED status)
    if (job.status === "APPLIED" && daysSinceApplied > 7 && daysSinceApplied <= 14) {
      nudges.push({
        id: job.id,
        type: "FOLLOW_UP",
        jobTitle: job.position,
        company: job.company,
        daysSinceUpdate: daysSinceApplied,
        status: job.status,
      });
      continue;
    }

    // Rule 3: Interview stage — nudge if prep package not yet generated
    if (isInterviewStage && !job.interviewPrepId) {
      nudges.push({
        id: job.id,
        type: "PREP_PENDING",
        jobTitle: job.position,
        company: job.company,
        daysSinceUpdate,
        status: job.status,
        prepUrl: `/dashboard/jobs/${job.id}/prep`,
      });
      continue;
    }

    // Rule 4: Interview stage — prep package is ready
    if (isInterviewStage && job.interviewPrepId) {
      nudges.push({
        id: job.id,
        type: "PREP_READY",
        jobTitle: job.position,
        company: job.company,
        daysSinceUpdate,
        status: job.status,
        prepUrl: `/dashboard/jobs/${job.id}/prep`,
      });
    }
  }

  // Sort: urgent (STALE) first, then by days waiting descending
  return nudges.sort((a, b) => {
    const urgencyOrder: Record<NudgeType, number> = {
      STALE: 0,
      FOLLOW_UP: 1,
      PREP_PENDING: 2,
      PREP_READY: 3,
      EVAL_READY: 4,
    };
    const urgencyDiff = urgencyOrder[a.type] - urgencyOrder[b.type];
    return urgencyDiff !== 0 ? urgencyDiff : b.daysSinceUpdate - a.daysSinceUpdate;
  });
}
