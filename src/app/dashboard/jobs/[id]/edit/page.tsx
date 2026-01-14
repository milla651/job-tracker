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
    <div className="min-h-[calc(100vh-4rem)] bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link
          href={`/dashboard/jobs/${id}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Job Details
        </Link>

        <JobForm mode="edit" job={job} />
      </div>
    </div>
  );
}
