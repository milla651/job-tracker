import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { getJobs } from "@/app/actions/jobs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pipeline",
  description: "Manage your job applications with a Kanban board.",
};

export default async function PipelinePage() {
  // Fetch a larger number of jobs for the board
  // We might need to implement infinite scroll or pagination within columns eventually
  // For now, fetching 100 most recent active jobs
  const { jobs } = await getJobs({ limit: 100, sort: "updated-desc" });

  return (
    <div className="h-[calc(100vh-1rem)] pt-24 p-4 overflow-hidden flex flex-col">
      <div className="mb-6 px-4">
        <h1 className="text-3xl font-bold tracking-tight text-gradient">
          Pipeline
        </h1>
        <p className="text-muted-foreground">
          Drag and drop to move applications through your pipeline stages.
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard initialJobs={jobs} />
      </div>
    </div>
  );
}
