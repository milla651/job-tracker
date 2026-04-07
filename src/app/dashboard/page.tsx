import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSmartNudges } from "@/app/actions/nudges";
import { AiScoreBadge } from "@/components/ai/AiScoreBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDistanceToNow } from "date-fns";
import {
  Plus,
  Briefcase,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  MessageSquare,
  Sparkles,
  BookOpen,
  Telescope,
  CheckCircle2,
  Circle,
  TrendingUp,
  Columns3,
} from "lucide-react";
import type { AiScore, JobStatus } from "@prisma/client";

export const metadata = { title: "Dashboard — CareerOS" };

// ── Data ──────────────────────────────────────────────────────────────────────

async function getDashboardData(userId: string) {
  const [jobs, nudges, stats, profile] = await Promise.all([
    prisma.jobApplication.findMany({
      where: { userId, status: { notIn: ["DISCARDED", "REJECTED", "WITHDRAWN"] } },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: { id: true, company: true, position: true, status: true, aiScore: true, updatedAt: true },
    }),
    getSmartNudges(),
    prisma.jobApplication.groupBy({
      by: ["status"],
      where: { userId },
      _count: { status: true },
    }),
    prisma.userProfile.findUnique({
      where: { userId },
      select: { completionPct: true, wizardCompleted: true },
    }),
  ]);

  const byStatus = Object.fromEntries(stats.map((s) => [s.status, s._count.status]));
  const total = stats.reduce((s, r) => s + r._count.status, 0);
  const active = (byStatus["APPLIED"] ?? 0) + (byStatus["PHONE_SCREEN"] ?? 0) + (byStatus["INTERVIEW"] ?? 0) + (byStatus["TECHNICAL"] ?? 0);

  return {
    jobs,
    nudges,
    profile,
    pipeline: {
      wishlist:  byStatus["WISHLIST"]     ?? 0,
      applied:   byStatus["APPLIED"]      ?? 0,
      screening: byStatus["PHONE_SCREEN"] ?? 0,
      interview: (byStatus["INTERVIEW"]   ?? 0) + (byStatus["TECHNICAL"] ?? 0),
      offer:     byStatus["OFFER"]        ?? 0,
      accepted:  byStatus["ACCEPTED"]     ?? 0,
      total,
      active,
    },
  };
}

// ── Stat Strip ────────────────────────────────────────────────────────────────

interface PipelineData {
  wishlist: number; applied: number; screening: number;
  interview: number; offer: number; accepted: number;
  total: number; active: number;
}

function StatStrip({ pipeline }: { pipeline: PipelineData }) {
  const stats = [
    { label: "Total",     value: pipeline.total,     href: "/dashboard/pipeline", color: "text-stone-700 dark:text-stone-200" },
    { label: "Active",    value: pipeline.active,    href: "/dashboard/pipeline", color: "text-blue-600 dark:text-blue-400" },
    { label: "Interview", value: pipeline.interview, href: "/dashboard/pipeline", color: "text-amber-600 dark:text-amber-400" },
    { label: "Offers",    value: pipeline.offer,     href: "/dashboard/pipeline", color: "text-emerald-600 dark:text-emerald-400" },
  ];
  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map(({ label, value, href, color }) => (
        <Link key={label} href={href}>
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 text-center hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm transition-all group">
            <p className={`text-2xl font-bold tabular-nums leading-none ${color}`}>{value}</p>
            <p className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wide mt-1.5">{label}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ── Pipeline Flow ─────────────────────────────────────────────────────────────

function PipelineFlow({ pipeline }: { pipeline: PipelineData }) {
  const stages = [
    { label: "Wishlist",  count: pipeline.wishlist,  dot: "bg-stone-400" },
    { label: "Applied",   count: pipeline.applied,   dot: "bg-blue-500" },
    { label: "Screening", count: pipeline.screening, dot: "bg-violet-500" },
    { label: "Interview", count: pipeline.interview, dot: "bg-amber-500" },
    { label: "Offer",     count: pipeline.offer,     dot: "bg-emerald-500" },
  ];

  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <Link href="/dashboard/pipeline" className="block group">
      <div className="flex items-end gap-2 h-14 mb-3">
        {stages.map((stage) => (
          <div key={stage.label} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center" style={{ height: "44px" }}>
              <div
                className={`w-full rounded-t-md opacity-80 group-hover:opacity-100 transition-all ${stage.dot.replace("bg-", "bg-")}`}
                style={{ height: `${Math.max((stage.count / max) * 44, stage.count > 0 ? 6 : 2)}px` }}
              />
            </div>
            <span className="text-[10px] font-bold tabular-nums text-stone-500">{stage.count}</span>
          </div>
        ))}
        {pipeline.accepted > 0 && (
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center" style={{ height: "44px" }}>
              <div
                className="w-full rounded-t-md bg-teal-500 opacity-80 group-hover:opacity-100 transition-all"
                style={{ height: `${Math.max((pipeline.accepted / max) * 44, 6)}px` }}
              />
            </div>
            <span className="text-[10px] font-bold tabular-nums text-stone-500">{pipeline.accepted}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-stone-400 group-hover:text-indigo-500 transition-colors">
        <Columns3 className="h-3 w-3" />
        Open pipeline board
        <ChevronRight className="h-3 w-3 ml-auto group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

// ── Nudge Card ────────────────────────────────────────────────────────────────

function NudgeCard({ nudge }: { nudge: Awaited<ReturnType<typeof getSmartNudges>>[number] }) {
  const config = {
    STALE:       { label: "Stale",       icon: AlertCircle,  accent: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-900/50" },
    FOLLOW_UP:   { label: "Follow up",   icon: MessageSquare,accent: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-950/30",   border: "border-blue-200 dark:border-blue-900/50" },
    PREP_READY:  { label: "Prep ready",  icon: BookOpen,     accent: "text-teal-500",   bg: "bg-teal-50 dark:bg-teal-950/30",   border: "border-teal-200 dark:border-teal-900/50" },
    PREP_PENDING:{ label: "Generate prep",icon: Sparkles,    accent: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/30",border: "border-indigo-200 dark:border-indigo-900/50" },
  } as const;

  const c = config[nudge.type as keyof typeof config] ?? config.STALE;
  const Icon = c.icon;
  const href = nudge.prepUrl ?? `/dashboard/jobs/${nudge.id}`;

  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all hover:shadow-sm hover:-translate-y-px ${c.bg} ${c.border}`}>
        <Icon className={`h-4 w-4 shrink-0 ${c.accent}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate leading-tight">{nudge.jobTitle}</p>
          <p className="text-xs text-stone-500 truncate">{nudge.company}</p>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wide shrink-0 ${c.accent}`}>{c.label}</span>
        <ChevronRight className="h-3.5 w-3.5 text-stone-300 shrink-0" />
      </div>
    </Link>
  );
}

// ── Job Row ───────────────────────────────────────────────────────────────────

function JobRow({ job }: { job: { id: string; company: string; position: string; status: string; aiScore: string | null; updatedAt: Date } }) {
  return (
    <Link href={`/dashboard/jobs/${job.id}`}>
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-900/60 rounded-xl transition-colors group cursor-pointer">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
          {job.company.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {job.position}
          </p>
          <p className="text-xs text-stone-400 truncate">{job.company}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AiScoreBadge score={job.aiScore as AiScore} size="sm" />
          <StatusBadge status={job.status as JobStatus} size="sm" />
          <span className="text-xs text-stone-400 hidden lg:block w-20 text-right">
            {formatDistanceToNow(job.updatedAt, { addSuffix: true })}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-400 transition-colors shrink-0" />
      </div>
    </Link>
  );
}

// ── Onboarding ────────────────────────────────────────────────────────────────

function OnboardingChecklist({ profilePct }: { profilePct: number }) {
  const steps = [
    { label: "Create your account",        done: true,          href: null,                    hint: null },
    { label: "Build your career profile",  done: profilePct >= 60, href: "/dashboard/profile", hint: "Unlock AI match scoring" },
    { label: "Explore job matches",        done: false,          href: "/dashboard/explore",    hint: "Discover curated opportunities" },
    { label: "Track your first application", done: false,        href: "/dashboard/jobs/new",   hint: "Start your pipeline" },
  ];

  const nextStep = steps.find((s) => !s.done);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-indigo-500" />
        </div>
        <div>
          <h2 className="font-semibold text-stone-900 dark:text-stone-50 text-sm">Get started</h2>
          <p className="text-xs text-stone-400 mt-0.5">Complete these steps to unlock the full platform.</p>
        </div>
      </div>
      <div className="p-3 space-y-1">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              nextStep === step
                ? "bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50"
                : "hover:bg-stone-50 dark:hover:bg-stone-800/40"
            }`}
          >
            {step.done ? (
              <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
            ) : nextStep === step ? (
              <div className="h-4 w-4 rounded-full border-2 border-indigo-400 shrink-0 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              </div>
            ) : (
              <Circle className="h-4 w-4 text-stone-300 dark:text-stone-700 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-snug ${step.done ? "text-stone-400 dark:text-stone-600 line-through" : "text-stone-800 dark:text-stone-100"}`}>
                {step.label}
              </p>
              {step.hint && !step.done && nextStep === step && (
                <p className="text-xs text-stone-400 mt-0.5">{step.hint}</p>
              )}
            </div>
            {!step.done && step.href && nextStep === step && (
              <Link
                href={step.href}
                className="shrink-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Start <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Empty ─────────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-6">
      <div className="h-14 w-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center mb-4 shadow-inner">
        <Briefcase className="h-6 w-6 text-indigo-400" />
      </div>
      <h3 className="text-base font-semibold text-stone-800 dark:text-stone-100 mb-1">No applications yet</h3>
      <p className="text-sm text-stone-400 mb-5 max-w-xs leading-relaxed">
        Add your first application manually or explore curated job matches.
      </p>
      <div className="flex gap-3">
        <Link
          href="/dashboard/jobs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-500/25 transition-all"
        >
          <Plus className="h-4 w-4" /> Add job
        </Link>
        <Link
          href="/dashboard/explore"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-sm font-medium transition-colors"
        >
          <Telescope className="h-4 w-4" /> Discover
        </Link>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { jobs, nudges, profile, pipeline } = await getDashboardData(session.user.id);
  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const profilePct = profile?.completionPct ?? 0;
  const isNewUser = pipeline.total === 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50">
              {greeting}, {firstName}.
            </h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">
              {isNewUser
                ? "Welcome to CareerOS — let's build your pipeline."
                : nudges.length > 0
                ? `${nudges.length} action${nudges.length !== 1 ? "s" : ""} waiting for you.`
                : "You're all caught up — keep the momentum going."}
            </p>
          </div>
          <Link
            href="/dashboard/jobs/new"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-500/20 transition-all hover:shadow-md hover:shadow-indigo-500/25"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Application</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>

        {/* ── Onboarding (new users) ────────────────────────────── */}
        {isNewUser && <OnboardingChecklist profilePct={profilePct} />}

        {/* ── Stats + Pipeline ──────────────────────────────────── */}
        {!isNewUser && (
          <>
            <StatStrip pipeline={pipeline} />

            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  Pipeline overview
                </h2>
                <span className="text-xs text-stone-400">{pipeline.total} total</span>
              </div>
              <PipelineFlow pipeline={pipeline} />
            </div>
          </>
        )}

        {/* ── Nudges ───────────────────────────────────────────── */}
        {nudges.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-stone-400 dark:text-stone-600 uppercase tracking-widest">
                Needs attention
              </h2>
              {nudges.length > 4 && (
                <Link href="/dashboard/activity" className="text-xs text-indigo-500 hover:underline">
                  +{nudges.length - 4} more
                </Link>
              )}
            </div>
            <div className="space-y-2">
              {nudges.slice(0, 4).map((nudge) => (
                <NudgeCard key={nudge.id} nudge={nudge} />
              ))}
            </div>
          </section>
        )}

        {/* ── Recent Applications ───────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-stone-400 dark:text-stone-600 uppercase tracking-widest">
              Recent Applications
            </h2>
            {jobs.length > 0 && (
              <Link href="/dashboard/pipeline" className="text-xs text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
            {jobs.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="divide-y divide-stone-50 dark:divide-stone-800/50 p-1.5">
                {jobs.map((job) => (
                  <JobRow key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
