import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getJobById, deleteJob } from "@/app/actions/jobs";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { StatusSelector } from "@/components/StatusSelector";
import { AiScoreBadge } from "@/components/ai/AiScoreBadge";
import { JobDetailTabs } from "@/components/jobs/JobDetailTabs";
import { ArrowLeft, Building2, Pencil, Trash2, MapPin, DollarSign } from "lucide-react";
import { formatSalary } from "@/lib/utils";
import type { AiScore } from "@/lib/db-types";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  const job = await getJobById(id);

  if (!job) notFound();

  const [prepPackage, stories] = await Promise.all([
    session?.user?.id
      ? db.interviewPrepPackage.findUnique({ where: { jobApplicationId: id } }).catch(() => null)
      : null,
    session?.user?.id
      ? db.storyBankEntry.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
        }).catch(() => [])
      : [],
  ]);

  const salaryText = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

        {/* ── Back nav ──────────────────────────────────────────── */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Dashboard
        </Link>

        {/* ── Job hero ──────────────────────────────────────────── */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          {/* Accent stripe */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Company avatar */}
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-md shadow-indigo-500/20">
                {job.company.charAt(0).toUpperCase()}
              </div>

              {/* Title + company + meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 flex-wrap">
                  <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50 leading-tight">
                    {job.position}
                  </h1>
                  <AiScoreBadge score={job.aiScore as AiScore} size="md" />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                  <span className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    {job.company}
                  </span>
                  {job.location && (
                    <span className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {job.location}
                    </span>
                  )}
                  {salaryText && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      <DollarSign className="h-3.5 w-3.5 shrink-0" />
                      {salaryText}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <StatusSelector jobId={job.id} currentStatus={job.status} />
                <Link href={`/dashboard/jobs/${job.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                </Link>
                <form action={async () => {
                  "use server";
                  await deleteJob(id);
                }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="submit"
                    className="text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabbed content ────────────────────────────────────── */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6">
          <JobDetailTabs
            job={job}
            prepPackage={prepPackage ?? null}
            stories={stories ?? []}
          />
        </div>

      </div>
    </div>
  );
}
