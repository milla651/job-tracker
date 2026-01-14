import Link from "next/link";
import { getJobs, getJobStats } from "@/app/actions/jobs";
import { JobCard } from "@/components/JobCard";
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
    <div className="min-h-[calc(100vh-4rem)] bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Track and manage your job applications
            </p>
          </div>
          <Link href="/dashboard/jobs/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Job
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/20">
                  <Briefcase className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Jobs</p>
                  <p className="text-2xl font-bold text-white">{jobs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-orange-500/20">
                  <Target className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-white">{activeJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Interview Rate</p>
                  <p className="text-2xl font-bold text-white">{interviewRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/20">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-white">{successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status breakdown */}
        {statsData && statsData.stats.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Applications by Status
              </h2>
              <div className="flex flex-wrap gap-3">
                {statsData.stats.map((stat) => (
                  <div
                    key={stat.status}
                    className={`px-4 py-2 rounded-lg border ${
                      STATUS_CONFIG[stat.status].color
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
            </CardContent>
          </Card>
        )}

        {/* Jobs List */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            All Applications
          </h2>

          {jobs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-gray-800/50 w-fit">
                  <Briefcase className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No job applications yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Start tracking your job search by adding your first application
                </p>
                <Link href="/dashboard/jobs/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Job
                  </Button>
                </Link>
              </CardContent>
            </Card>
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
