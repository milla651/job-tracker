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
  MessageSquare,
  Trophy,
  TrendingUp,
  Bell,
  ChevronRight,
  Compass,
  Kanban,
  Clock,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export const metadata = { title: "Dashboard — CareerOS" };

// ── Server helpers ────────────────────────────────────────────────────────────

async function getDashboardData(userId: string) {
  const [jobs, nudges] = await Promise.all([
    prisma.jobApplication.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        company: true,
        position: true,
        status: true,
        aiScore: true,
        updatedAt: true,
        appliedAt: true,
      },
    }),
    getSmartNudges(),
  ]);

  const stats = await prisma.jobApplication.groupBy({
    by: ["status"],
    where: { userId },
    _count: { status: true },
  });

  const byStatus = Object.fromEntries(
    stats.map((s) => [s.status, s._count.status])
  );

  return {
    jobs,
    nudges,
    stats: {
      total: stats.reduce((s, r) => s + r._count.status, 0),
      active:
        (byStatus["APPLIED"] ?? 0) +
        (byStatus["PHONE_SCREEN"] ?? 0) +
        (byStatus["INTERVIEW"] ?? 0) +
        (byStatus["TECHNICAL"] ?? 0),
      interviews:
        (byStatus["INTERVIEW"] ?? 0) + (byStatus["TECHNICAL"] ?? 0),
      offers: byStatus["OFFER"] ?? 0,
      accepted: byStatus["ACCEPTED"] ?? 0,
    },
  };
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  href,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  accent: string;
  href?: string;
}) {
  const inner = (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white dark:bg-stone-900 p-5 transition-all duration-200 hover:shadow-md ${accent}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-4xl font-bold text-stone-900 dark:text-stone-50 tabular-nums">
            {value}
          </p>
        </div>
        <div className={`p-2.5 rounded-xl ${accent.replace("border-", "bg-").replace("/30", "/15")}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {href && (
        <div className="mt-3 flex items-center gap-1 text-xs text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors">
          View all <ChevronRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ── Nudge Item ────────────────────────────────────────────────────────────────

function NudgeItem({
  nudge,
}: {
  nudge: Awaited<ReturnType<typeof getSmartNudges>>[number];
}) {
  const isUrgent = nudge.daysSinceUpdate > 14;
  return (
    <Link href={`/dashboard/jobs/${nudge.id}`}>
      <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group">
        <div
          className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
            isUrgent
              ? "bg-orange-400 animate-pulse"
              : "bg-teal-400"
          }`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
            {nudge.company}
          </p>
          <p className="text-xs text-stone-500 truncate">{nudge.jobTitle}</p>
          <p
            className={`text-xs mt-0.5 ${
              isUrgent
                ? "text-orange-500 dark:text-orange-400"
                : "text-teal-600 dark:text-teal-400"
            }`}
          >
            {nudge.type === "STALE"
              ? `No activity in ${nudge.daysSinceUpdate} days`
              : `Follow up — applied ${nudge.daysSinceUpdate}d ago`}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500 dark:group-hover:text-stone-400 transition-colors shrink-0 mt-0.5" />
      </div>
    </Link>
  );
}

// ── Recent Job Row ────────────────────────────────────────────────────────────

function JobRow({
  job,
}: {
  job: {
    id: string;
    company: string;
    position: string;
    status: string;
    aiScore: string | null;
    updatedAt: Date;
  };
}) {
  return (
    <Link href={`/dashboard/jobs/${job.id}`}>
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 rounded-xl transition-colors group">
        {/* Company initial */}
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 dark:from-teal-500 dark:to-teal-700 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
          {job.company.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {job.position}
          </p>
          <p className="text-xs text-stone-500 truncate">{job.company}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <AiScoreBadge score={job.aiScore as never} size="sm" />
          <StatusBadge status={job.status as never} size="sm" />
          <span className="text-xs text-stone-400 hidden sm:block w-16 text-right">
            {formatDistanceToNow(job.updatedAt, { addSuffix: false })}
          </span>
        </div>

        <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500 transition-colors shrink-0" />
      </div>
    </Link>
  );
}

// ── Quick Action Button ───────────────────────────────────────────────────────

function QuickAction({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md transition-all duration-200 group">
        <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 transition-colors">
          <Icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{label}</p>
          <p className="text-xs text-stone-500 truncate">{description}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-stone-300 group-hover:text-teal-500 transition-colors ml-auto shrink-0" />
      </div>
    </Link>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-2xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center mb-4">
        <Briefcase className="h-8 w-8 text-teal-500" />
      </div>
      <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-1">
        Start your job search
      </h3>
      <p className="text-sm text-stone-500 mb-6 max-w-xs">
        Add your first application or explore AI-curated matches.
      </p>
      <div className="flex gap-3">
        <Link
          href="/dashboard/jobs/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add application
        </Link>
        <Link
          href="/dashboard/explore"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-sm font-medium transition-colors"
        >
          <Compass className="h-4 w-4" />
          Explore jobs
        </Link>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { jobs, nudges, stats } = await getDashboardData(session.user.id);
  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50">
              {greeting}, {firstName}.
            </h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">
              {stats.total === 0
                ? "Let's start building your pipeline."
                : `${stats.active} active application${stats.active !== 1 ? "s" : ""} in your pipeline.`}
            </p>
          </div>
          <Link
            href="/dashboard/jobs/new"
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold shadow-sm shadow-teal-500/25 transition-all hover:shadow-md hover:shadow-teal-500/30"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </Link>
        </div>

        {/* ── Stats row ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total"
            value={stats.total}
            icon={Briefcase}
            accent="border-stone-200 dark:border-stone-800"
            href="/dashboard/pipeline"
          />
          <StatCard
            label="Active"
            value={stats.active}
            icon={TrendingUp}
            accent="border-teal-200/60 dark:border-teal-800/60 text-teal-600 dark:text-teal-400"
            href="/dashboard/tracker"
          />
          <StatCard
            label="Interviews"
            value={stats.interviews}
            icon={MessageSquare}
            accent="border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400"
            href="/dashboard/tracker"
          />
          <StatCard
            label={stats.accepted > 0 ? "Accepted" : "Offers"}
            value={stats.accepted > 0 ? stats.accepted : stats.offers}
            icon={Trophy}
            accent="border-amber-200/60 dark:border-amber-800/60 text-amber-600 dark:text-amber-400"
            href="/dashboard/tracker"
          />
        </div>

        {/* ── Main grid ────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Recent Applications (2/3 width) ──────────────────────── */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800">
                <h2 className="font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-stone-400" />
                  Recent Applications
                </h2>
                <Link
                  href="/dashboard/pipeline"
                  className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
                >
                  View all
                </Link>
              </div>

              {jobs.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="divide-y divide-stone-50 dark:divide-stone-800/50 p-1">
                  {jobs.map((job) => (
                    <JobRow key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right column (1/3 width) ──────────────────────────────── */}
          <div className="space-y-5">

            {/* Smart Nudges */}
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800">
                <h2 className="font-semibold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-stone-400" />
                  Nudges
                  {nudges.length > 0 && (
                    <span className="ml-1 h-5 min-w-5 px-1.5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 text-xs font-bold flex items-center justify-center">
                      {nudges.length}
                    </span>
                  )}
                </h2>
              </div>

              {nudges.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="h-5 w-5 text-teal-500" />
                  </div>
                  <p className="text-xs text-stone-500">All caught up.</p>
                </div>
              ) : (
                <div className="p-2">
                  {nudges.slice(0, 4).map((nudge) => (
                    <NudgeItem key={nudge.id} nudge={nudge} />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-1">
                Quick Actions
              </p>
              <div className="space-y-2">
                <QuickAction
                  href="/dashboard/explore"
                  icon={Compass}
                  label="Explore Jobs"
                  description="AI-curated matches for you"
                />
                <QuickAction
                  href="/dashboard/tracker"
                  icon={Kanban}
                  label="Kanban Board"
                  description="Drag & drop your pipeline"
                />
                <QuickAction
                  href="/dashboard/stories"
                  icon={MessageSquare}
                  label="Story Bank"
                  description="Build your STAR stories"
                />
                <QuickAction
                  href="/dashboard/profile"
                  icon={Sparkles}
                  label="Career Profile"
                  description="Unlock AI job scoring"
                />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
