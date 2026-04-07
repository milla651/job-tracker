"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  callClaudeJson,
  isAiEnabled,
  CLAUDE_SONNET,
  CLAUDE_HAIKU,
} from "@/lib/claude";
import { buildUserSystemPrompt } from "@/lib/prompts/system-prompt";
import {
  buildPredictQuestionsPrompt,
  PredictedQuestionsSchema,
  type PredictedQuestions,
} from "@/lib/prompts/predict-questions";
import type { InterviewPrepPackage } from "@prisma/client";

// ── Get prep package ──────────────────────────────────────────────────────────

export async function getPrepPackage(
  jobApplicationId: string
): Promise<InterviewPrepPackage | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const job = await prisma.jobApplication.findFirst({
      where: { id: jobApplicationId, userId: session.user.id },
    });
    if (!job) return null;

    return await prisma.interviewPrepPackage.findUnique({
      where: { jobApplicationId },
    });
  } catch {
    return null;
  }
}

// ── Generate prep package ─────────────────────────────────────────────────────

export async function generatePrepPackage(
  jobApplicationId: string
): Promise<{ success: true; package: InterviewPrepPackage } | { success: false; error: string }> {
  if (!isAiEnabled()) {
    return { success: false, error: "AI evaluation is not enabled" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  // Fetch job with ownership check
  const job = await prisma.jobApplication.findFirst({
    where: { id: jobApplicationId, userId: session.user.id },
    include: { aiEvaluation: true },
  });
  if (!job) {
    return { success: false, error: "Job not found" };
  }

  if (!job.description || job.description.trim().length < 50) {
    return {
      success: false,
      error: "Job description is too short. Add more details first.",
    };
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  const model = profile ? CLAUDE_SONNET : CLAUDE_HAIKU;
  const systemPrompt = buildUserSystemPrompt(profile);

  // Build question prediction prompt
  const companyResearchJson = job.aiEvaluation?.companyResearch;
  const companyResearchStr = companyResearchJson
    ? JSON.stringify(companyResearchJson, null, 2)
    : undefined;

  const userMessage = buildPredictQuestionsPrompt({
    company: job.company,
    position: job.position,
    description: job.description,
    companyResearch: companyResearchStr,
  });

  // Call Claude for question prediction
  let questions: PredictedQuestions;
  try {
    const raw = await callClaudeJson<PredictedQuestions>({
      userId: session.user.id,
      systemPrompt,
      userMessage,
      model,
      maxTokens: 4000,
    });
    const parsed = PredictedQuestionsSchema.safeParse(raw);
    if (!parsed.success) throw new Error("Invalid questions format");
    questions = parsed.data;
  } catch (e) {
    const message = e instanceof Error ? e.message : "AI call failed";
    return { success: false, error: message };
  }

  // Match stories to behavioral questions
  const stories = await prisma.storyBankEntry.findMany({
    where: { userId: session.user.id },
    select: { id: true, title: true, tags: true, impact: true },
  });

  const suggestedStories = questions.behavioral.map((q, idx) => {
    const matched = stories.find((s) =>
      q.whyAsked.toLowerCase().includes(s.tags[0]?.toLowerCase() ?? "") ||
      s.tags.some((t) => q.question.toLowerCase().includes(t))
    );
    return matched
      ? { questionIndex: idx, questionType: "behavioral", storyId: matched.id, storyTitle: matched.title, matchReason: "Tag overlap" }
      : null;
  }).filter(Boolean);

  // Persist (upsert)
  const prepPackage = await prisma.interviewPrepPackage.upsert({
    where: { jobApplicationId },
    create: {
      jobApplicationId,
      companyResearch: job.aiEvaluation?.companyResearch ?? {},
      predictedQuestions: questions as object,
      suggestedStories: suggestedStories as object,
    },
    update: {
      companyResearch: job.aiEvaluation?.companyResearch ?? {},
      predictedQuestions: questions as object,
      suggestedStories: suggestedStories as object,
    },
  });

  revalidatePath(`/dashboard/jobs/${jobApplicationId}/prep`);
  return { success: true, package: prepPackage };
}

// ── Save prep notes ───────────────────────────────────────────────────────────

export async function savePrepNotes(
  jobApplicationId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const job = await prisma.jobApplication.findFirst({
      where: { id: jobApplicationId, userId: session.user.id },
    });
    if (!job) return { success: false, error: "Job not found" };

    await prisma.interviewPrepPackage.upsert({
      where: { jobApplicationId },
      create: { jobApplicationId, prepNotes: notes },
      update: { prepNotes: notes },
    });

    revalidatePath(`/dashboard/jobs/${jobApplicationId}/prep`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save notes" };
  }
}

// ── Auto-trigger (non-blocking) ───────────────────────────────────────────────

export async function triggerPrepPackageAsync(
  jobApplicationId: string
): Promise<void> {
  generatePrepPackage(jobApplicationId).catch(() => {
    // Silently fail — prep is non-critical
  });
}
