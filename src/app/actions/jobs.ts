"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { JobStatus } from "@prisma/client";

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

export async function getJobs(status?: JobStatus) {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const jobs = await prisma.jobApplication.findMany({
    where: {
      userId: session.user.id,
      ...(status && { status }),
    },
    orderBy: { updatedAt: "desc" },
  });

  return jobs;
}

export async function getJobById(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const job = await prisma.jobApplication.findUnique({
    where: { id: jobId },
    include: {
      timeline: {
        orderBy: { eventDate: "desc" },
      },
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
