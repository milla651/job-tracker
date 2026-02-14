"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";
import { subDays, startOfDay, format } from "date-fns";

export type DailyActivity = {
  date: string;
  count: number;
};

export type PipelineStat = {
  status: JobStatus;
  count: number;
};

export async function getApplicationActivity(): Promise<DailyActivity[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const daysToFetch = 365; // Last year
  const startDate = subDays(new Date(), daysToFetch);

  // Group by date using Prisma's raw query for performance or easier aggregation
  // Since Prisma doesn't support grouping by date part easily out of the box with SQLite/Postgres unification sometimes,
  // we'll fetch metadata and aggregate in JS for simplicity unless dataset is huge.
  // For < 1000 jobs, JS aggregation is microsecond fast.
  
  const jobs = await prisma.jobApplication.findMany({
    where: {
      userId: session.user.id,
      appliedAt: {
        gte: startDate,
      },
    },
    select: {
      appliedAt: true,
    },
  });

  // Aggregate
  const activityMap = new Map<string, number>();
  
  jobs.forEach((job) => {
    const dateKey = format(job.appliedAt, "yyyy-MM-dd");
    activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
  });

  // Convert to array
  const activity: DailyActivity[] = Array.from(activityMap.entries()).map(
    ([date, count]) => ({ date, count })
  );

  return activity;
}

export async function getPipelineStats(): Promise<PipelineStat[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const stats = await prisma.jobApplication.groupBy({
    by: ["status"],
    where: {
      userId: session.user.id,
    },
    _count: {
      status: true,
    },
  });

  // Map to a cleaner format
  return stats.map((stat) => ({
    status: stat.status,
    count: stat._count.status,
  }));
}
