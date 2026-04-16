import Link from "next/link";
import { getJobs, getJobStats } from "@/app/actions/jobs";
import { getApplicationActivity, getPipelineStats } from "@/app/actions/analytics";
import { JobListing } from "@/components/dashboard/JobListing";
import { ActivityHeatmap } from "@/components/analytics/ActivityHeatmap";
import { PipelineFunnel } from "@/components/analytics/PipelineFunnel";
import { Button } from "@/components/ui/button";
import { ActivitySidebar } from "./components/ActivitySidebar";
import { JobStatus } from "@/lib/db-types";
import { Plus, ClipboardList, BarChart2 } from "lucide-react";

export const metadata = { title: "Applications — CareerOS" };

export default async function ActivityPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page      = Number(searchParams?.page) || 1;
  const search    = searchParams?.search    as string | undefined;
  const status    = searchParams?.status    as JobStatus | undefined;
  const sort      = searchParams?.sort      as string | undefined;
  const location  = searchParams?.location  as string | undefined;
  const minSalary = searchParams?.minSalary ? Number(searchParams.minSalary) : undefined;
  const maxSalary = searchParams?.maxSalary ? Number(searchParams.maxSalary) : undefined;

  const [{ jobs, total, totalPages }, statsData, activityData, pipelineData] = await Promise.all([
    getJobs({ page, search, status, sort, location, minSalary, maxSalary }),
    getJobStats(),
    getApplicationActivity(),
    getPipelineStats(),
  ]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Applications</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Full history of your job search activity</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/explore">
              <Button variant="outline" size="sm" className="gap-1.5 text-sm">
                <Plus className="h-4 w-4" /> Explore
              </Button>
            </Link>
            <Link href="/dashboard/jobs/new">
              <Button size="sm" className="gap-1.5 text-sm">
                <Plus className="h-4 w-4" /> Add job
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Analytics charts ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-lg border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Activity heatmap</h2>
            </div>
            <ActivityHeatmap data={activityData} />
          </div>
          <div className="bg-card rounded-lg border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pipeline funnel</h2>
            </div>
            <PipelineFunnel data={pipelineData} />
          </div>
        </div>

        {/* ── Content ──────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-5">
          {/* Sidebar: stats + nudges */}
          <aside className="w-full md:w-64 lg:w-72 shrink-0 md:sticky md:top-8 md:self-start space-y-4">
            <ActivitySidebar total={total} statsData={statsData} />
          </aside>

          {/* Job listing */}
          <main className="flex-1 min-w-0 bg-card rounded-lg border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">
                {total} application{total !== 1 ? "s" : ""}
              </h2>
            </div>
            <div className="p-4">
              <JobListing
                initialJobs={jobs}
                total={total}
                totalPages={totalPages}
                currentPage={page}
              />
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}
