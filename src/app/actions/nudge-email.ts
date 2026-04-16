"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSmartNudges } from "@/app/actions/nudges";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "CareerOS <noreply@benardkimani.co.ke>";
const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ── Toggle nudge emails ───────────────────────────────────────────────────────

export async function toggleNudgeEmails(
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await db.userProfile.upsert({
      where: { userId: session.user.id },
      update: { emailNudgesEnabled: enabled },
      create: {
        userId: session.user.id,
        primaryRoles: [],
        archetypes: [],
        emailNudgesEnabled: enabled,
      },
    });
    return { success: true };
  } catch (err) {
    console.error("[toggleNudgeEmails] failed:", err);
    return { success: false, error: "Failed to update preference" };
  }
}

// ── Send nudge digest to one user ─────────────────────────────────────────────

export async function sendNudgeDigestForUser(userId: string): Promise<void> {
  const [user, profile] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
    db.userProfile.findUnique({ where: { userId }, select: { emailNudgesEnabled: true } }),
  ]);

  if (!user || !profile?.emailNudgesEnabled) return;

  // Temporarily spoof session context — nudges action uses auth() internally,
  // so we call the DB directly here for the batch path.
  const nudges = await getNudgesForUser(userId);
  if (nudges.length === 0) return;

  const nudgeRows = nudges
    .map((n) => {
      const icon = n.type === "STALE" ? "⏰" : n.type === "FOLLOW_UP" ? "📨" : n.type === "PREP_READY" ? "📋" : "✨";
      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
            <span style="font-size: 18px;">${icon}</span>
          </td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0;">
            <strong>${n.jobTitle} @ ${n.company}</strong><br/>
            <span style="color: #666; font-size: 14px;">${n.message}</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
            <a href="${domain}/dashboard/jobs/${n.jobId}" style="color: #0ea5e9; font-size: 13px; text-decoration: none;">View →</a>
          </td>
        </tr>`;
    })
    .join("");

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <div style="background: linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%); padding: 32px 24px; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Your Weekly Career Digest</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">
          ${nudges.length} action${nudges.length !== 1 ? "s" : ""} waiting for your attention
        </p>
      </div>
      <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          ${nudgeRows}
        </table>
        <div style="margin-top: 24px; text-align: center;">
          <a href="${domain}/dashboard" style="background: #0ea5e9; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Open Dashboard
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
          <a href="${domain}/dashboard/settings" style="color: #9ca3af;">Unsubscribe from nudge emails</a>
        </p>
      </div>
    </div>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: user.email,
      subject: `${nudges.length} job action${nudges.length !== 1 ? "s" : ""} need your attention — CareerOS`,
      html,
    });
  } catch (err) {
    console.error(`[sendNudgeDigestForUser] failed for ${userId}:`, err);
  }
}

// ── Send digest to current logged-in user (manual trigger from settings) ──────

export async function sendMyNudgeDigest(): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await sendNudgeDigestForUser(session.user.id);
    return { success: true };
  } catch (err) {
    console.error("[sendMyNudgeDigest] failed:", err);
    return { success: false, error: "Failed to send digest" };
  }
}

// ── Batch send to all opted-in users (call from a cron/webhook) ───────────────

export async function sendNudgeDigestToAll(): Promise<{ sent: number }> {
  const profiles = await db.userProfile.findMany({
    where: { emailNudgesEnabled: true },
    select: { userId: true },
  });

  let sent = 0;
  for (const { userId } of profiles) {
    await sendNudgeDigestForUser(userId);
    sent++;
  }

  return { sent };
}

// ── Internal: fetch nudges by userId without auth() context ──────────────────

async function getNudgesForUser(userId: string) {
  const now = new Date();
  const staleThresholdDays = 14;
  const followUpThresholdDays = 7;

  const jobs = await db.jobApplication.findMany({
    where: {
      userId,
      status: {
        notIn: ["ACCEPTED", "REJECTED", "WITHDRAWN", "DISCARDED"],
      },
    },
    select: {
      id: true,
      company: true,
      position: true,
      status: true,
      updatedAt: true,
      interviewPrep: { select: { id: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const nudges: Array<{
    type: string;
    jobId: string;
    jobTitle: string;
    company: string;
    message: string;
  }> = [];

  for (const job of jobs) {
    const daysSinceUpdate = Math.floor(
      (now.getTime() - job.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (job.status === "APPLIED" && daysSinceUpdate >= followUpThresholdDays) {
      nudges.push({
        type: "FOLLOW_UP",
        jobId: job.id,
        jobTitle: job.position,
        company: job.company,
        message: `${daysSinceUpdate} days since applying — time to follow up.`,
      });
    } else if (daysSinceUpdate >= staleThresholdDays) {
      nudges.push({
        type: "STALE",
        jobId: job.id,
        jobTitle: job.position,
        company: job.company,
        message: `No update in ${daysSinceUpdate} days — update or archive.`,
      });
    } else if (
      ["PHONE_SCREEN", "INTERVIEW", "TECHNICAL"].includes(job.status) &&
      job.interviewPrep
    ) {
      nudges.push({
        type: "PREP_READY",
        jobId: job.id,
        jobTitle: job.position,
        company: job.company,
        message: "Interview prep package is ready to review.",
      });
    }
  }

  return nudges.slice(0, 10);
}
