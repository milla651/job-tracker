import Link from "next/link";
import { getJobs, getJobStats } from "@/app/actions/jobs";
import { JobListing } from "@/components/dashboard/JobListing";
import { Button } from "@/components/ui/button";
import { STATUS_CONFIG } from "@/lib/utils";
import {
  Plus,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { SmartNudges } from "@/components/dashboard/SmartNudges";
import { JobStatus } from "@prisma/client";

export default async function ActivityPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const search = searchParams?.search as string | undefined;
  const status = (searchParams?.status as JobStatus) || undefined;
  const sort = searchParams?.sort as string | undefined;
  const location = searchParams?.location as string | undefined;
  const minSalary = searchParams?.minSalary
    ? Number(searchParams.minSalary)
    : undefined;
  const maxSalary = searchParams?.maxSalary
    ? Number(searchParams.maxSalary)
    : undefined;

  // Pass options to getJobs
  const [{ jobs, total, totalPages }, statsData] = await Promise.all([
    getJobs({ page, search, status, sort, location, minSalary, maxSalary }),
    getJobStats(),
  ]);

  const totalApplications = statsData?.total || 0;

  // Calculate stats from the aggregated data
  const statusCounts =
    statsData?.stats.reduce(
      (
        acc: Record<string, number>,
        curr: { status: JobStatus; _count: { status: number } },
      ) => {
        acc[curr.status] = curr._count.status;
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

  const activeCount =
    totalApplications -
    (statusCounts.ACCEPTED || 0) -
    (statusCounts.REJECTED || 0) -
    (statusCounts.WITHDRAWN || 0);

  const successRate =
    totalApplications > 0
      ? Math.round(((statusCounts["ACCEPTED"] || 0) / totalApplications) * 100)
      : 0;

  const interviewCount =
    (statusCounts["INTERVIEW"] || 0) +
    (statusCounts["TECHNICAL"] || 0) +
    (statusCounts["OFFER"] || 0) +
    (statusCounts["ACCEPTED"] || 0);

  const interviewRate =
    totalApplications > 0
      ? Math.round((interviewCount / totalApplications) * 100)
      : 0;

  const archivedCount =
    (statusCounts.WITHDRAWN || 0) + (statusCounts.REJECTED || 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden pt-24">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-mesh dark:bg-mesh-dark" />
      <div className="absolute inset-0 bg-aurora" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-float-delayed" />
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span className="text-gradient">Your Activity</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Overview of your applications and results
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/explore">
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Explore Jobs
              </Button>
            </Link>
            <Link href="/dashboard/jobs/new">
              <Button className="bg-gradient-brand shadow-lg hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4 mr-2" />
                Add Job
              </Button>
            </Link>
          </div>
        </div>

        {/* Smart Nudges */}
        <SmartNudges />

        {/* Enhanced Stats Grid with better spacing and hierarchy */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Primary Stats */}
          <div className="glass-card-hover p-6 lg:col-span-2 bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-200 dark:border-blue-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Total Applications
                </p>
                <p className="text-4xl font-bold text-foreground">
                  {totalApplications}
                </p>
                <div className="flex gap-4 mt-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Active</p>
                    <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      {activeCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Archived</p>
                    <p className="text-lg font-semibold text-slate-500 dark:text-slate-400">
                      {archivedCount}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-200 dark:border-blue-800">
                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="glass-card-hover p-6 bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-200 dark:border-emerald-800">
            <div className="flex flex-col h-full justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Success Rate
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {successRate}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {statusCounts.ACCEPTED || 0} accepted
                </p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mt-auto" />
            </div>
          </div>

          {/* Interview Progress */}
          <div className="glass-card-hover p-6 bg-gradient-to-br from-orange-500/5 to-transparent border border-orange-200 dark:border-orange-800">
            <div className="flex flex-col h-full justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Interview Rate
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {interviewRate}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {interviewCount} interviews
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400 mt-auto" />
            </div>
          </div>

          {/* Active */}
          <div className="glass-card-hover p-6 bg-gradient-to-br from-teal-500/5 to-transparent border border-teal-200 dark:border-teal-800">
            <div className="flex flex-col h-full justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  In Progress
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {activeCount}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Awaiting updates
                </p>
              </div>
              <Clock className="w-6 h-6 text-teal-600 dark:text-teal-400 mt-auto" />
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Pipeline Status
            </h3>
            <p className="text-xs text-muted-foreground">
              {total} applications found
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {statsData &&
              statsData.stats.map(
                (stat: { status: JobStatus; _count: { status: number } }) => {
                  const config = STATUS_CONFIG[stat.status];
                  return (
                    <div
                      key={stat.status}
                      className="glass-card-hover p-4 text-center hover:shadow-md transition-shadow rounded-xl border border-border/50">
                      <p className="text-2xl font-bold text-foreground">
                        {stat._count.status}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                        {config.label}
                      </p>
                    </div>
                  );
                },
              )}
          </div>
        </div>

        {/* Jobs Listing with Advanced Filters */}
        <div>
          <div className="mb-6 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Applications
              </h2>
            </div>
            <JobListing
              initialJobs={jobs}
              total={total}
              totalPages={totalPages}
              currentPage={page}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
