"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ScrapedJob } from "@/lib/mock-jobs";
import { JobStatus } from "@prisma/client";

export async function savePublicJob(job: ScrapedJob, type: 'WISHLIST' | 'APPLIED' | 'DISCARDED') {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    // Check if job already exists for this user to avoid duplicates
    // We can use the job URL or company+position as a unique constraint proxy
    const existingJob = await prisma.jobApplication.findFirst({
        where: {
            userId: session.user.id,
            position: job.title,
            company: job.company,
        }
    });

    if (existingJob) {
        return { error: "You have already interacted with this job." };
    }

    // Parse salary to min/max if possible, otherwise store raw string in notes
    // For this mock, we'll do a simple parse or just leave null
    let salaryMin = null;
    let salaryMax = null;

    // Simple parser for "$140k - $180k" format
    const salaryMatch = job.salary.match(/(\d+)k\s*-\s*\$?(\d+)k/);
    if (salaryMatch) {
        salaryMin = parseInt(salaryMatch[1]) * 1000;
        salaryMax = parseInt(salaryMatch[2]) * 1000;
    }

    await prisma.jobApplication.create({
      data: {
        userId: session.user.id,
        company: job.company,
        position: job.title,
        location: job.location,
        jobUrl: job.url,
        description: job.description,
        status: type === 'WISHLIST' ? JobStatus.WISHLIST : type === 'APPLIED' ? JobStatus.APPLIED : JobStatus.DISCARDED,
        salaryMin,
        salaryMax,
        notes: `Saved from Public Jobs Board. Original Salary: ${job.salary}`,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, jobId: job.id };
  } catch (error) {
    console.error("Failed to save job:", error);
    return { error: "Failed to save job" };
  }
}
