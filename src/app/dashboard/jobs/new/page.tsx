import { JobForm } from "@/components/JobForm";

export default function NewJobPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <JobForm mode="create" />
      </div>
    </div>
  );
}
