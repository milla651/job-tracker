import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { userCacheTag } from "@/lib/cache-tags";
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
import type { AiScore, JobStatus } from "@/lib/db-types";

export const metadata = { title: "Dashboard — CareerOS" };

// ── Data ──────────────────────────────────────────────────────────────────────

async function getDashboardData(userId: string) {
  const [jobs, nudges, stats, profile] = await Promise.all([
    db.jobApplication.findMany({
      where: { userId, status: { notIn: ["DISCARDED", "REJECTED", "WITHDRAWN"] } },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: { id: true, company: true, position: true, status: true, aiScore: true, updatedAt: true },
    }),
    getSmartNudges(),
    db.jobApplication.groupBy({
      by: ["status"],
      where: { userId },
      _count: { status: true },
    }),
    db.userProfile.findUnique({
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

function loadCachedDashboard(userId: string) {
  return unstable_cache(
    async () => getDashboardData(userId),
    ["dashboard", userId],
    { revalidate: 60, tags: [userCacheTag(userId)] }
  )();
}

// ── Stat Strip ────────────────────────────────────────────────────────────────

interface PipelineData {
  wishlist: number; applied: number; screening: number;
  interview: number; offer: number; accepted: number;
  total: number; active: number;
}

function StatStrip({ pipeline }: { pipeline: PipelineData }) {
  const stats = [
    { label: "Total",     value: pipeline.total,     href: "/dashboard/pipeline", color: "text-foreground" },
    { label: "Active",    value: pipeline.active,    href: "/dashboard/pipeline", color: "text-blue-600 dark:text-blue-400" },
    { label: "Interview", value: pipeline.interview, href: "/dashboard/pipeline", color: "text-amber-600 dark:text-amber-400" },
    { label: "Offers",    value: pipeline.offer,     href: "/dashboard/pipeline", color: "text-emerald-600 dark:text-emerald-400" },
  ];
  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map(({ label, value, href, color }) => (
        <Link key={label} href={href}>
          <div className="bg-card border border-border rounded-lg p-4 text-center hover:border-primary/30 hover:shadow-sm transition-all group">
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
            <span className="text-[10px] font-bold tabular-nums text-muted-foreground">{stage.count}</span>
          </div>
        ))}
        {pipeline.accepted > 0 && (
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end justify-center" style={{ height: "44px" }}>
              <div
                className="w-full rounded-t-md bg-success opacity-80 group-hover:opacity-100 transition-all"
                style={{ height: `${Math.max((pipeline.accepted / max) * 44, 6)}px` }}
              />
            </div>
            <span className="text-[10px] font-bold tabular-nums text-stone-500">{pipeline.accepted}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-primary transition-colors">
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
    PREP_READY:  { label: "Prep ready",  icon: BookOpen,     accent: "text-success",    bg: "bg-success/8",                    border: "border-success/20" },
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
          <p className="text-sm font-semibold text-foreground truncate leading-tight">{nudge.jobTitle}</p>
          <p className="text-xs text-muted-foreground truncate">{nudge.company}</p>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wide shrink-0 ${c.accent}`}>{c.label}</span>
        <ChevronRight className="h-3.5 w-3.5 text-border shrink-0" />
      </div>
    </Link>
  );
}

// ── Job Row ───────────────────────────────────────────────────────────────────

function JobRow({ job }: { job: { id: string; company: string; position: string; status: string; aiScore: string | null; updatedAt: Date } }) {
  return (
    <Link href={`/dashboard/jobs/${job.id}`}>
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 rounded-xl transition-colors group cursor-pointer">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/80 to-gradient-2 flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0">
          {job.company.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {job.position}
          </p>
          <p className="text-xs text-muted-foreground truncate">{job.company}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AiScoreBadge score={job.aiScore as AiScore} size="sm" />
          <StatusBadge status={job.status as JobStatus} size="sm" />
          <span className="text-xs text-muted-foreground hidden lg:block w-20 text-right">
            {formatDistanceToNow(job.updatedAt, { addSuffix: true })}
          </span>
        </div>
        <ChevronRight className="h-4 w-4 text-border group-hover:text-muted-foreground transition-colors shrink-0" />
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
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-border flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-foreground text-sm">Get started</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Complete these steps to unlock the full platform.</p>
        </div>
      </div>
      <div className="p-3 space-y-1">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              nextStep === step
                ? "bg-primary/8 border border-primary/20"
                : "hover:bg-muted"
            }`}
          >
            {step.done ? (
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
            ) : nextStep === step ? (
              <div className="h-4 w-4 rounded-full border-2 border-primary shrink-0 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              </div>
            ) : (
              <Circle className="h-4 w-4 text-border shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-snug ${step.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {step.label}
              </p>
              {step.hint && !step.done && nextStep === step && (
                <p className="text-xs text-muted-foreground mt-0.5">{step.hint}</p>
              )}
            </div>
            {!step.done && step.href && nextStep === step && (
              <Link
                href={step.href}
                className="shrink-0 text-xs font-semibold text-primary hover:underline flex items-center gap-1"
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
      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 shadow-inner">
        <Briefcase className="h-6 w-6 text-primary/60" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">No applications yet</h3>
      <p className="text-sm text-muted-foreground mb-5 max-w-xs leading-relaxed">
        Add your first application manually or explore curated job matches.
      </p>
      <div className="flex gap-3">
        <Link
          href="/dashboard/jobs/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-semibold shadow-sm shadow-primary/20 transition-all"
        >
          <Plus className="h-4 w-4" /> Add job
        </Link>
        <Link
          href="/dashboard/explore"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted text-sm font-medium transition-colors"
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

  const { jobs, nudges, profile, pipeline } = await loadCachedDashboard(session.user.id);
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
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {greeting}, {firstName}.
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {isNewUser
                ? "Welcome to CareerOS — let's build your pipeline."
                : nudges.length > 0
                ? `${nudges.length} action${nudges.length !== 1 ? "s" : ""} waiting for you.`
                : "You're all caught up — keep the momentum going."}
            </p>
          </div>
          <Link
            href="/dashboard/jobs/new"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-semibold shadow-sm shadow-primary/20 transition-all hover:shadow-md"
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

            <div className="bg-card rounded-lg border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Pipeline overview
                </h2>
                <span className="text-xs text-muted-foreground">{pipeline.total} total</span>
              </div>
              <PipelineFlow pipeline={pipeline} />
            </div>
          </>
        )}

        {/* ── Nudges ───────────────────────────────────────────── */}
        {nudges.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Needs attention
              </h2>
              {nudges.length > 4 && (
                <Link href="/dashboard/activity" className="text-xs text-primary hover:underline">
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
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Recent Applications
            </h2>
            {jobs.length > 0 && (
              <Link href="/dashboard/pipeline" className="text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-1">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden">
            {jobs.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="divide-y divide-border/50 p-1.5">
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
