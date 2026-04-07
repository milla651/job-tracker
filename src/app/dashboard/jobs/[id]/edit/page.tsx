import { notFound } from "next/navigation";
import { getJobById } from "@/app/actions/jobs";
import { JobForm } from "@/components/JobForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden pt-8">
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

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href={`/dashboard/jobs/${id}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Job Details
        </Link>

        <JobForm mode="edit" job={job} />
      </div>
    </div>
  );
}
