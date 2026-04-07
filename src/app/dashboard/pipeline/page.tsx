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
      <div className="px-6 py-4 bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 shrink-0">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
              <Columns3 className="h-4 w-4 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-base font-bold text-stone-900 dark:text-stone-50 leading-none">Pipeline</h1>
              <p className="text-xs text-stone-400 mt-0.5 leading-none">
                {jobs.length} application{jobs.length !== 1 ? "s" : ""} — drag to update status
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/jobs/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm shadow-indigo-500/20 transition-all"
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
