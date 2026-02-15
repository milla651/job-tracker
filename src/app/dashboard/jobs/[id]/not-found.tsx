import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 p-4 rounded-full bg-gray-800/50 w-fit">
          <FileQuestion className="w-12 h-12 text-gray-600" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Job Not Found</h1>
        <p className="text-gray-400 mb-6">
          The job application you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Link href="/dashboard">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
