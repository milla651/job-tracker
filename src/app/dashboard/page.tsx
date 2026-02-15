import Link from "next/link";
import { getJobs, getJobStats } from "@/app/actions/jobs";
import { JobListing } from "@/components/dashboard/JobListing";
import { Button } from "@/components/ui/button";
import { STATUS_CONFIG } from "@/lib/utils";
import { Plus, Briefcase, TrendingUp, Target, CheckCircle } from "lucide-react";
import { SmartNudges } from "@/components/dashboard/SmartNudges";
import { JobStatus } from "@prisma/client";

export default async function DashboardPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const search = searchParams?.search as string | undefined;
  const status = (searchParams?.status as JobStatus) || undefined;
  const sort = searchParams?.sort as string | undefined;
  const location = searchParams?.location as string | undefined;
  const minSalary = searchParams?.minSalary ? Number(searchParams.minSalary) : undefined;
  const maxSalary = searchParams?.maxSalary ? Number(searchParams.maxSalary) : undefined;

  // Pass options to getJobs
  // Note: getJobStats doesn't need filters as it shows overall stats
  const [{ jobs, total, totalPages }, statsData] = await Promise.all([
    getJobs({ page, search, status, sort, location, minSalary, maxSalary }),
    getJobStats(),
  ]);

  const activeJobs = statsData?.total || 0; // Using total from stats for now, or we can use the aggregation
  // Actually, getJobStats returns { stats, total }. 
  // Let's recalculate rates based on the statsData, not the filtered `jobs` list.

  const totalApplications = statsData?.total || 0;

  // Calculate stats from the aggregated data to be accurate across all jobs
  const statusCounts = statsData?.stats.reduce((acc: Record<string, number>, curr: { status: JobStatus, _count: { status: number } }) => {
    acc[curr.status] = curr._count.status;
    return acc;
  }, {} as Record<string, number>) || {};

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
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your job applications
            </p>
          </div>
          <Link href="/dashboard/jobs/new">
            <Button className="bg-gradient-brand shadow-lg hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4 mr-2" />
              Add Job
            </Button>
          </Link>
        </div>

        {/* Smart Nudges */}
        <SmartNudges />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card-hover p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-md">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Jobs</p>
                <p className="text-2xl font-bold text-foreground">{totalApplications}</p>
              </div>
            </div>
          </div>

          <div className="glass-card-hover p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-md">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Active</p>
                <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              </div>
            </div>
          </div>

          {statsData && statsData.stats.map((stat: { status: JobStatus, _count: { status: number } }) => {
            const config = STATUS_CONFIG[stat.status];
            return (
              <div key={stat.status} className="glass-card-hover p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl border ${config.color.replace('text-', 'border-').split(' ')[2]} bg-background shadow-sm`}>
                    <span className="text-2xl">{config.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{config.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat._count.status}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Jobs List */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            All Applications
          </h2>

          <JobListing
            initialJobs={jobs}
            total={total}
            totalPages={totalPages}
            currentPage={page}
          />
        </div>
      </div>
    </div>
  );
}
