import Link from "next/link";
import { getJobs, getJobStats } from "@/app/actions/jobs";
import { JobCard } from "@/components/JobCard";
import { DashboardEmptyState } from "@/components/DashboardEmptyState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { STATUS_CONFIG } from "@/lib/utils";
import { Plus, Briefcase, TrendingUp, Target, CheckCircle } from "lucide-react";

export default async function DashboardPage() {
  const [jobs, statsData] = await Promise.all([getJobs(), getJobStats()]);

  const activeJobs = jobs.filter(
    (job) =>
      !["ACCEPTED", "REJECTED", "WITHDRAWN"].includes(job.status)
  ).length;

  const successRate =
    jobs.length > 0
      ? Math.round(
        (jobs.filter((job) => job.status === "ACCEPTED").length / jobs.length) *
        100
      )
      : 0;

  const interviewRate =
    jobs.length > 0
      ? Math.round(
        (jobs.filter((job) =>
          ["INTERVIEW", "TECHNICAL", "OFFER", "ACCEPTED"].includes(job.status)
        ).length /
          jobs.length) *
        100
      )
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card-hover p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-md">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Jobs</p>
                <p className="text-2xl font-bold text-foreground">{jobs.length}</p>
              </div>
            </div>
          </div>

          <div className="glass-card-hover p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-md">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Active</p>
                <p className="text-2xl font-bold text-foreground">{activeJobs}</p>
              </div>
            </div>
          </div>

          <div className="glass-card-hover p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Interview Rate</p>
                <p className="text-2xl font-bold text-foreground">{interviewRate}%</p>
              </div>
            </div>
          </div>

          <div className="glass-card-hover p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Success Rate</p>
                <p className="text-2xl font-bold text-foreground">{successRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status breakdown */}
        {statsData && statsData.stats.length > 0 && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Applications by Status
            </h2>
            <div className="flex flex-wrap gap-3">
              {statsData.stats.map((stat) => (
                <div
                  key={stat.status}
                  className={`px-4 py-2 rounded-lg border ${STATUS_CONFIG[stat.status].color
                    }`}
                >
                  <span className="mr-2">{STATUS_CONFIG[stat.status].icon}</span>
                  <span className="font-medium">
                    {STATUS_CONFIG[stat.status].label}
                  </span>
                  <span className="ml-2 opacity-75">({stat._count.status})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jobs List */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            All Applications
          </h2>

          {jobs.length === 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <DashboardEmptyState />
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
