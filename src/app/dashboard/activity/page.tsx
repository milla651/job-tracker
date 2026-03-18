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
import { ActivitySidebar } from "./components/ActivitySidebar";
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

        {/* Layout Grid (Sidebar + Main Content) */}
        <div className="flex flex-col md:flex-row gap-6 mt-8">
          {/* Left Sidebar (Stats + Nudges) */}
          <aside className="w-full md:w-64 lg:w-72 shrink-0 md:sticky md:top-24 md:self-start md:max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar pb-4 space-y-6">
             <ActivitySidebar total={total} statsData={statsData} />
          </aside>

          {/* Main Content (Job Listing) */}
          <main className="flex-1 min-w-0">

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

          </main>
        </div>
      </div>
    </div>
  );
}
