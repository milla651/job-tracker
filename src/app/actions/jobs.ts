"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateUserCache } from "@/lib/cache-tags";
import {
  getJobByIdWithRelations,
  listJobsWithTotal,
  splitListResult,
  updateJobStatusTransactional,
} from "@/lib/queries/jobs";
import { redirect } from "next/navigation";
import { JobStatus } from "@/lib/db-types";
import { triggerEvaluationAsync } from "@/app/actions/ai-evaluation";
import { triggerPrepPackageAsync } from "@/app/actions/interview-prep";

const INTERVIEW_STATUSES: JobStatus[] = ["PHONE_SCREEN", "INTERVIEW", "TECHNICAL"];
const ARCHIVE_ON_ACCEPT_STATUSES: JobStatus[] = [
  "WISHLIST", "APPLIED", "PHONE_SCREEN", "INTERVIEW", "TECHNICAL",
];

export async function createJob(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const company = formData.get("company") as string;
  const position = formData.get("position") as string;
  const location = formData.get("location") as string | null;
  const salaryMin = formData.get("salaryMin") as string | null;
  const salaryMax = formData.get("salaryMax") as string | null;
  const jobUrl = formData.get("jobUrl") as string | null;
  const description = formData.get("description") as string | null;
  const notes = formData.get("notes") as string | null;
  const status = (formData.get("status") as JobStatus) || "APPLIED";

  if (!company || !position) {
    return { error: "Company and position are required" };
  }

  const job = await db.jobApplication.create({
    data: {
      company,
      position,
      location: location || null,
      salaryMin: salaryMin ? parseInt(salaryMin) : null,
      salaryMax: salaryMax ? parseInt(salaryMax) : null,
      jobUrl: jobUrl || null,
      description: description || null,
      notes: notes || null,
      status,
      userId: session.user.id,
      timeline: {
        create: {
          eventType: "CREATED",
          description: `Job application created with status: ${status}`,
        },
      },
    },
  });

  // Trigger AI evaluation in background (non-blocking)
  triggerEvaluationAsync(job.id);

  revalidatePath("/dashboard");
  revalidateUserCache(session.user.id);
  redirect(`/dashboard/jobs/${job.id}`);
}

export async function updateJob(jobId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const job = await db.jobApplication.findUnique({
    where: { id: jobId },
  });

  if (!job || job.userId !== session.user.id) {
    return { error: "Job not found or unauthorized" };
  }

  const company = formData.get("company") as string;
  const position = formData.get("position") as string;
  const location = formData.get("location") as string | null;
  const salaryMin = formData.get("salaryMin") as string | null;
  const salaryMax = formData.get("salaryMax") as string | null;
  const jobUrl = formData.get("jobUrl") as string | null;
  const description = formData.get("description") as string | null;
  const notes = formData.get("notes") as string | null;

  await db.jobApplication.update({
    where: { id: jobId },
    data: {
      company,
      position,
      location: location || null,
      salaryMin: salaryMin ? parseInt(salaryMin) : null,
      salaryMax: salaryMax ? parseInt(salaryMax) : null,
      jobUrl: jobUrl || null,
      description: description || null,
      notes: notes || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/jobs/${jobId}`);
  revalidateUserCache(session.user.id);
  redirect(`/dashboard/jobs/${jobId}`);
}

export async function updateJobStatus(jobId: string, newStatus: JobStatus) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const job = await db.jobApplication.findUnique({
    where: { id: jobId },
  });

  if (!job || job.userId !== session.user.id) {
    return { error: "Job not found or unauthorized" };
  }

  const oldStatus = job.status;

  await updateJobStatusTransactional(
    jobId,
    session.user.id,
    newStatus,
    `Status changed from ${oldStatus} to ${newStatus}`
  );

  // When ACCEPTED → archive all other active applications
  if (newStatus === "ACCEPTED") {
    await db.jobApplication.updateMany({
      where: {
        userId: session.user.id,
        id: { not: jobId },
        status: { in: ARCHIVE_ON_ACCEPT_STATUSES },
      },
      data: { status: "WITHDRAWN" },
    });
  }

  // Trigger prep package generation when moving into an interview stage for the first time
  if (INTERVIEW_STATUSES.includes(newStatus) && !INTERVIEW_STATUSES.includes(oldStatus)) {
    triggerPrepPackageAsync(jobId);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/jobs/${jobId}`);
  revalidateUserCache(session.user.id);
}

export async function deleteJob(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const job = await db.jobApplication.findUnique({
    where: { id: jobId },
  });

  if (!job || job.userId !== session.user.id) {
    return { error: "Job not found or unauthorized" };
  }

  await db.jobApplication.delete({
    where: { id: jobId },
  });

  revalidatePath("/dashboard");
  revalidateUserCache(session.user.id);
  redirect("/dashboard");
}

export type GetJobsOptions = {
  status?: JobStatus;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  location?: string;
  minSalary?: number;
  maxSalary?: number;
};

export async function getJobs(options: GetJobsOptions = {}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { jobs: [], total: 0, totalPages: 0 };
  }

  const { status, search, page = 1, limit = 12, sort = "date-desc", location, minSalary, maxSalary } = options;

  const rows = await listJobsWithTotal({
    userId: session.user.id,
    status,
    search,
    location,
    minSalary,
    maxSalary,
    sort,
    page,
    limit,
  });
  const { jobs, total } = splitListResult(rows);

  return {
    jobs,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getJobById(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return getJobByIdWithRelations(jobId, session.user.id);
}

export async function getJobStats() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const stats = await db.jobApplication.groupBy({
    by: ["status"],
    where: { userId: session.user.id },
    _count: { status: true },
  });

  const total = await db.jobApplication.count({
    where: { userId: session.user.id },
  });

  return { stats, total };
}

export async function addTimelineEvent(
  jobId: string,
  eventType: string,
  description: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const job = await db.jobApplication.findUnique({
    where: { id: jobId },
  });

  if (!job || job.userId !== session.user.id) {
    return { error: "Job not found or unauthorized" };
  }

  await db.timelineEvent.create({
    data: {
      jobApplicationId: jobId,
      eventType,
      description,
    },
  });

  revalidatePath(`/dashboard/jobs/${jobId}`);
  revalidateUserCache(session.user.id);
}
