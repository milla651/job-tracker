"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { JobStatus } from "@prisma/client";
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

  const job = await prisma.jobApplication.create({
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
  redirect(`/dashboard/jobs/${job.id}`);
}

export async function updateJob(jobId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const job = await prisma.jobApplication.findUnique({
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

  await prisma.jobApplication.update({
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
  redirect(`/dashboard/jobs/${jobId}`);
}

export async function updateJobStatus(jobId: string, newStatus: JobStatus) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const job = await prisma.jobApplication.findUnique({
    where: { id: jobId },
  });

  if (!job || job.userId !== session.user.id) {
    return { error: "Job not found or unauthorized" };
  }

  const oldStatus = job.status;

  // Update status + log timeline event
  await prisma.$transaction([
    prisma.jobApplication.update({
      where: { id: jobId },
      data: { status: newStatus },
    }),
    prisma.timelineEvent.create({
      data: {
        jobApplicationId: jobId,
        eventType: "STATUS_CHANGE",
        description: `Status changed from ${oldStatus} to ${newStatus}`,
      },
    }),
  ]);

  // When ACCEPTED → archive all other active applications
  if (newStatus === "ACCEPTED") {
    await prisma.jobApplication.updateMany({
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
}

export async function deleteJob(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const job = await prisma.jobApplication.findUnique({
    where: { id: jobId },
  });

  if (!job || job.userId !== session.user.id) {
    return { error: "Job not found or unauthorized" };
  }

  await prisma.jobApplication.delete({
    where: { id: jobId },
  });

  revalidatePath("/dashboard");
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
  const skip = (page - 1) * limit;

  const where: any = {
    userId: session.user.id,
    ...(status && { status }),
    ...(search && {
      OR: [
        { company: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(location && {
      location: { contains: location, mode: "insensitive" },
    }),
    ...(minSalary && {
      salaryMax: { gte: minSalary },
    }),
    ...(maxSalary && {
      salaryMin: { lte: maxSalary },
    }),
  };

  let orderBy: any = { updatedAt: "desc" };

  switch (sort) {
    case "date-asc":
      orderBy = { updatedAt: "asc" };
      break;
    case "company-asc":
      orderBy = { company: "asc" };
      break;
    case "company-desc":
      orderBy = { company: "desc" };
      break;
    case "salary-desc":
      orderBy = { salaryMax: "desc" }; // prioritizing max salary
      break;
    case "salary-asc":
      orderBy = { salaryMin: "asc" }; // prioritizing min salary
      break;
    case "location-asc":
      orderBy = { location: "asc" };
      break;
    case "location-desc":
      orderBy = { location: "desc" };
      break;

    case "date-desc":
    default:
      orderBy = { updatedAt: "desc" };
      break;
  }

  const [jobs, total] = await prisma.$transaction([
    prisma.jobApplication.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.jobApplication.count({ where }),
  ]);

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

  const job = await prisma.jobApplication.findUnique({
    where: { id: jobId },
    include: {
      timeline: { orderBy: { eventDate: "desc" } },
      aiEvaluation: true,
    },
  });

  if (!job || job.userId !== session.user.id) {
    return null;
  }

  return job;
}

export async function getJobStats() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const stats = await prisma.jobApplication.groupBy({
    by: ["status"],
    where: { userId: session.user.id },
    _count: { status: true },
  });

  const total = await prisma.jobApplication.count({
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

  const job = await prisma.jobApplication.findUnique({
    where: { id: jobId },
  });

  if (!job || job.userId !== session.user.id) {
    return { error: "Job not found or unauthorized" };
  }

  await prisma.timelineEvent.create({
    data: {
      jobApplicationId: jobId,
      eventType,
      description,
    },
  });

  revalidatePath(`/dashboard/jobs/${jobId}`);
}
