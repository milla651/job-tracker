"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  callClaudeJson,
  isAiEnabled,
  CLAUDE_SONNET,
  CLAUDE_HAIKU,
} from "@/lib/claude";
import { buildUserSystemPrompt } from "@/lib/prompts/system-prompt";
import {
  buildEvaluateJobPrompt,
  EvaluationResultSchema,
  EVALUATE_JOB_PROMPT_VERSION,
  type EvaluationResult,
} from "@/lib/prompts/evaluate-job";
import type { AiEvaluation, AiScore } from "@prisma/client";

// ── Get existing evaluation ──────────────────────────────────────────────────

export async function getEvaluation(
  jobApplicationId: string
): Promise<AiEvaluation | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    const job = await prisma.jobApplication.findFirst({
      where: { id: jobApplicationId, userId: session.user.id },
    });
    if (!job) return null;

    return await prisma.aiEvaluation.findUnique({ where: { jobApplicationId } });
  } catch {
    return null;
  }
}

// ── Evaluate a job ───────────────────────────────────────────────────────────

export async function evaluateJob(
  jobApplicationId: string
): Promise<{ success: true; evaluation: AiEvaluation } | { success: false; error: string }> {
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
  });
  if (!job) {
    return { success: false, error: "Job not found" };
  }

  if (!job.description || job.description.trim().length < 50) {
    return {
      success: false,
      error: "Job description is too short for evaluation. Add more details.",
    };
  }

  // Fetch user profile
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  // Choose model: Sonnet if profile exists (needs nuance), Haiku if no profile
  const model = profile ? CLAUDE_SONNET : CLAUDE_HAIKU;

  // Build prompts
  const systemPrompt = buildUserSystemPrompt(profile);
  const userMessage = buildEvaluateJobPrompt({
    company: job.company,
    position: job.position,
    location: job.location,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    description: job.description,
  });

  // Call Claude
  let rawResult: EvaluationResult;
  try {
    rawResult = await callClaudeJson<EvaluationResult>({
      userId: session.user.id,
      systemPrompt,
      userMessage,
      model,
      maxTokens: 6000,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI call failed";
    return { success: false, error: message };
  }

  // Validate response
  const parsed = EvaluationResultSchema.safeParse(rawResult);
  if (!parsed.success) {
    return { success: false, error: "AI returned invalid response format" };
  }

  const result = parsed.data;

  // Persist evaluation (upsert — re-evaluation replaces old)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const evaluation = await prisma.aiEvaluation.upsert({
    where: { jobApplicationId },
    create: {
      jobApplicationId,
      score: result.score as AiScore,
      scoreNumeric: result.scoreNumeric,
      summary: result.summary,
      cvMatchPercent: result.cvMatchPercent,
      keyGaps: result.keyGaps,
      keyStrengths: result.keyStrengths,
      compensationSignal: result.compensationSignal,
      fullReport: result as object,
      companyResearch: result.blockD as object,
      personalizationPlan: result.blockE as object,
      modelUsed: model,
      promptVersion: EVALUATE_JOB_PROMPT_VERSION,
      expiresAt,
    },
    update: {
      score: result.score as AiScore,
      scoreNumeric: result.scoreNumeric,
      summary: result.summary,
      cvMatchPercent: result.cvMatchPercent,
      keyGaps: result.keyGaps,
      keyStrengths: result.keyStrengths,
      compensationSignal: result.compensationSignal,
      fullReport: result as object,
      companyResearch: result.blockD as object,
      personalizationPlan: result.blockE as object,
      modelUsed: model,
      promptVersion: EVALUATE_JOB_PROMPT_VERSION,
      expiresAt,
    },
  });

  // Cache the letter grade on the job itself (for fast UI rendering)
  await prisma.jobApplication.update({
    where: { id: jobApplicationId },
    data: { aiScore: result.score as AiScore },
  });

  return { success: true, evaluation };
}

// ── Refresh evaluation ───────────────────────────────────────────────────────

export async function refreshEvaluation(jobApplicationId: string) {
  return evaluateJob(jobApplicationId);
}

// ── Auto-evaluate on job create (non-blocking) ───────────────────────────────
// Call this fire-and-forget after creating a job application.

export async function triggerEvaluationAsync(
  jobApplicationId: string
): Promise<void> {
  // Run without awaiting — let it complete in the background
  evaluateJob(jobApplicationId).catch(() => {
    // Silently fail — evaluation is non-critical
  });
}
