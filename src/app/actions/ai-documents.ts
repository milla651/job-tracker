"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callClaude, isAiEnabled, CLAUDE_SONNET } from "@/lib/claude";
import { buildUserSystemPrompt } from "@/lib/prompts/system-prompt";
import { buildCoverLetterPrompt } from "@/lib/prompts/generate-cover-letter";
import {
  buildTailorResumePrompt,
  TailoredResumeSchema,
  type TailoredResume,
} from "@/lib/prompts/tailor-resume";
import { buildNegotiationScriptPrompt } from "@/lib/prompts/negotiation-script";

// ── Shared job + profile fetch ────────────────────────────────────────────────

async function getJobAndProfile(jobApplicationId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [job, profile] = await Promise.all([
    prisma.jobApplication.findFirst({
      where: { id: jobApplicationId, userId: session.user.id },
      include: { aiEvaluation: true },
    }),
    prisma.userProfile.findUnique({ where: { userId: session.user.id } }),
  ]);

  if (!job) return null;
  return { job, profile, userId: session.user.id };
}

// ── Cover letter ──────────────────────────────────────────────────────────────

export async function generateCoverLetter(
  jobApplicationId: string
): Promise<{ success: true; text: string } | { success: false; error: string }> {
  if (!isAiEnabled()) return { success: false, error: "AI is not enabled" };

  const ctx = await getJobAndProfile(jobApplicationId);
  if (!ctx) return { success: false, error: "Job not found or unauthorized" };

  const { job, profile, userId } = ctx;

  if (!job.description) {
    return { success: false, error: "Add a job description first so AI can tailor the letter." };
  }

  const evaluation = job.aiEvaluation;
  const fullReport = evaluation?.fullReport as Record<string, unknown> | null;
  const topTalkingPoints = Array.isArray(fullReport?.topTalkingPoints)
    ? (fullReport.topTalkingPoints as string[])
    : undefined;

  try {
    const text = await callClaude({
      userId,
      model: CLAUDE_SONNET,
      systemPrompt: buildUserSystemPrompt(profile),
      userMessage: buildCoverLetterPrompt({
        company: job.company,
        position: job.position,
        description: job.description,
        evaluationSummary: evaluation?.summary ?? undefined,
        topTalkingPoints,
      }),
      maxTokens: 1024,
    });

    return { success: true, text };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[generateCoverLetter] failed:", message);
    return { success: false, error: message };
  }
}

// ── Tailored resume ───────────────────────────────────────────────────────────

export async function tailorResume(
  jobApplicationId: string
): Promise<{ success: true; resume: TailoredResume } | { success: false; error: string }> {
  if (!isAiEnabled()) return { success: false, error: "AI is not enabled" };

  const ctx = await getJobAndProfile(jobApplicationId);
  if (!ctx) return { success: false, error: "Job not found or unauthorized" };

  const { job, profile, userId } = ctx;

  if (!profile?.baseCvContent) {
    return { success: false, error: "Upload your CV in your profile first." };
  }
  if (!job.description) {
    return { success: false, error: "Add a job description first." };
  }

  const evaluation = job.aiEvaluation;
  const fullReport = evaluation?.fullReport as Record<string, unknown> | null;
  const topTalkingPoints = Array.isArray(fullReport?.topTalkingPoints)
    ? (fullReport.topTalkingPoints as string[])
    : undefined;
  const keywords = Array.isArray(fullReport?.atsKeywords)
    ? (fullReport.atsKeywords as string[])
    : undefined;

  try {
    const text = await callClaude({
      userId,
      model: CLAUDE_SONNET,
      systemPrompt: buildUserSystemPrompt(profile),
      userMessage:
        buildTailorResumePrompt({
          company: job.company,
          position: job.position,
          description: job.description,
          evaluationSummary: evaluation?.summary ?? undefined,
          topTalkingPoints,
          keywords,
        }) + "\n\nRespond with valid JSON only. No markdown fences.",
      maxTokens: 4096,
    });

    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const resume = TailoredResumeSchema.parse(JSON.parse(cleaned));
    return { success: true, resume };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[tailorResume] failed:", message);
    return { success: false, error: message };
  }
}

// ── Negotiation script ────────────────────────────────────────────────────────

export async function generateNegotiationScript(
  jobApplicationId: string
): Promise<{ success: true; text: string } | { success: false; error: string }> {
  if (!isAiEnabled()) return { success: false, error: "AI is not enabled" };

  const ctx = await getJobAndProfile(jobApplicationId);
  if (!ctx) return { success: false, error: "Job not found or unauthorized" };

  const { job, profile, userId } = ctx;

  if (!job.offerBase) {
    return {
      success: false,
      error: "Add offer details (base salary) to the job first.",
    };
  }
  if (!profile?.targetCompMin || !profile?.targetCompMax) {
    return {
      success: false,
      error: "Set your compensation targets in your profile first.",
    };
  }

  try {
    const text = await callClaude({
      userId,
      model: CLAUDE_SONNET,
      systemPrompt: buildUserSystemPrompt(profile),
      userMessage: buildNegotiationScriptPrompt({
        company: job.company,
        position: job.position,
        offerBase: job.offerBase,
        offerEquity: job.offerEquity,
        offerBonus: job.offerBonus,
        targetCompMin: profile.targetCompMin,
        targetCompMax: profile.targetCompMax,
        minimumComp: profile.minimumComp,
        currency: profile.compCurrency,
      }),
      maxTokens: 1024,
    });

    return { success: true, text };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[generateNegotiationScript] failed:", message);
    return { success: false, error: message };
  }
}
