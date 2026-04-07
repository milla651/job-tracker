import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { getJobs } from "@/app/actions/jobs";
import { Metadata } from "next";
import Link from "next/link";
import { Plus, Columns3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Pipeline — CareerOS",
  description: "Manage your job applications with a visual Kanban board.",
};

export default async function PipelinePage() {
  const { jobs } = await getJobs({ limit: 100, sort: "updated-desc" });

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ── Header bar ───────────────────────────────────────── */}
      <div className="px-6 py-4 bg-card border-b border-border shrink-0">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Columns3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-none">Pipeline</h1>
              <p className="text-xs text-muted-foreground mt-0.5 leading-none">
                {jobs.length} application{jobs.length !== 1 ? "s" : ""} — drag to update status
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/jobs/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-sm font-semibold shadow-sm shadow-primary/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add job</span>
          </Link>
        </div>
      </div>

      {/* ── Kanban board ─────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden p-4">
        <KanbanBoard initialJobs={jobs} />
      </div>
    </div>
  );
}
