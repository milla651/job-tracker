"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { revalidateUserCache } from "@/lib/cache-tags";
import { z } from "zod/v4";
import type { UserProfile } from "@/lib/db-types";

// ── Validation schemas ───────────────────────────────────────────────────────

const Step1Schema = z.object({
  location: z.string().optional(),
  timezone: z.string().optional(),
  visaSponsorship: z.boolean().optional(),
  workPreference: z.enum(["REMOTE", "HYBRID", "ONSITE"]).optional(),
});

const Step2Schema = z.object({
  primaryRoles: z.array(z.string().min(1)).min(1, "Add at least one target role"),
  seniority: z.enum(["JUNIOR", "MID", "SENIOR", "STAFF", "PRINCIPAL"]),
  archetypes: z.array(z.string()).optional(),
  headline: z.string().max(200).optional(),
  exitStory: z.string().max(1000).optional(),
});

const Step3Schema = z.object({
  superpower1: z.string().max(200).optional(),
  superpower2: z.string().max(200).optional(),
  superpower3: z.string().max(200).optional(),
  targetCompMin: z.number().int().positive().optional(),
  targetCompMax: z.number().int().positive().optional(),
  minimumComp: z.number().int().positive().optional(),
  compCurrency: z.string().length(3).optional(),
  linkedInUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
});

export type ProfileStep1Data = z.infer<typeof Step1Schema>;
export type ProfileStep2Data = z.infer<typeof Step2Schema>;
export type ProfileStep3Data = z.infer<typeof Step3Schema>;

// ── Helpers ──────────────────────────────────────────────────────────────────

function calcCompletionPct(profile: Partial<UserProfile>): number {
  const fields: Array<keyof UserProfile> = [
    "location",
    "workPreference",
    "seniority",
    "headline",
    "exitStory",
    "superpower1",
    "targetCompMin",
    "targetCompMax",
    "minimumComp",
    "baseCvContent",
  ];
  const filled = fields.filter(
    (f) => profile[f] !== null && profile[f] !== undefined && profile[f] !== ""
  );
  // primaryRoles counts as 2 fields if populated
  const roleBonus =
    Array.isArray(profile.primaryRoles) && profile.primaryRoles.length > 0
      ? 2
      : 0;
  return Math.round(((filled.length + roleBonus) / (fields.length + 2)) * 100);
}

// ── Get profile ──────────────────────────────────────────────────────────────

export async function getProfile(): Promise<UserProfile | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    return await db.userProfile.findUnique({
      where: { userId: session.user.id },
    });
  } catch {
    // Table doesn't exist yet (migration pending) — return null gracefully
    return null;
  }
}

// ── Upsert profile (step-by-step) ────────────────────────────────────────────

export async function upsertProfileStep1(
  data: ProfileStep1Data
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = Step1Schema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const existing = await db.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  const updated = await db.userProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: parsed.data,
  });

  const pct = calcCompletionPct({ ...existing, ...updated });
  await db.userProfile.update({
    where: { userId: session.user.id },
    data: { completionPct: pct },
  });

  revalidatePath("/dashboard");
  revalidateUserCache(session.user.id);
  return { success: true };
}

export async function upsertProfileStep2(
  data: ProfileStep2Data
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = Step2Schema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const existing = await db.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  const updated = await db.userProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: parsed.data,
  });

  const pct = calcCompletionPct({ ...existing, ...updated });
  await db.userProfile.update({
    where: { userId: session.user.id },
    data: { completionPct: pct },
  });

  revalidatePath("/dashboard");
  revalidateUserCache(session.user.id);
  return { success: true };
}

export async function upsertProfileStep3(
  data: ProfileStep3Data
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = Step3Schema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const existing = await db.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  const updated = await db.userProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data },
    update: parsed.data,
  });

  const pct = calcCompletionPct({ ...existing, ...updated });
  await db.userProfile.update({
    where: { userId: session.user.id },
    data: { completionPct: pct, wizardCompleted: true },
  });

  revalidatePath("/dashboard");
  revalidateUserCache(session.user.id);
  return { success: true };
}

// ── Store extracted CV text ──────────────────────────────────────────────────

export async function saveCvContent(
  content: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  if (content.trim().length < 100) {
    return { success: false, error: "CV content too short — extraction may have failed" };
  }

  const existing = await db.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  const updated = await db.userProfile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, baseCvContent: content },
    update: { baseCvContent: content },
  });

  const pct = calcCompletionPct({ ...existing, ...updated });
  await db.userProfile.update({
    where: { userId: session.user.id },
    data: { completionPct: pct },
  });

  revalidatePath("/dashboard/profile");
  revalidateUserCache(session.user.id);
  return { success: true };
}
