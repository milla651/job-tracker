"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";
import { differenceInDays } from "date-fns";

export type NudgeType = "STALE" | "FOLLOW_UP";

export interface Nudge {
  id: string; // job id
  type: NudgeType;
  jobTitle: string;
  company: string;
  daysSinceUpdate: number;
  status: JobStatus;
}

export async function getSmartNudges(): Promise<Nudge[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const nudges: Nudge[] = [];
  const now = new Date();

  // Fetch all active jobs
  const jobs = await prisma.jobApplication.findMany({
    where: {
      userId: session.user.id,
      status: {
        notIn: ["REJECTED", "WITHDRAWN", "OFFER", "ACCEPTED", "WISHLIST"],
      },
    },
    select: {
      id: true,
      position: true,
      company: true,
      updatedAt: true,
      appliedAt: true,
      status: true,
    },
  });

  for (const job of jobs) {
    const daysSinceUpdate = differenceInDays(now, job.updatedAt);
    const daysSinceApplied = differenceInDays(now, job.appliedAt);

    // Rule 1: Stale Jobs (Active but no update for > 14 days)
    // Excluding APPLIED status from "Stale" if it's caught by "Follow Up" logic, 
    // but generally if it's been 14 days and no movement, it's stale.
    if (daysSinceUpdate > 14) {
      nudges.push({
        id: job.id,
        type: "STALE",
        jobTitle: job.position,
        company: job.company,
        daysSinceUpdate,
        status: job.status,
      });
      continue; // Don't double count
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
    }
  }

  // Sort by days waiting (descending)
  return nudges.sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);
}
