import { listUserCVsByPosition } from "@/app/actions/cv-reuse";
import { CVLibraryClient } from "./CVLibraryClient";
import { FileText, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CVLibraryPage() {
  const cvsByPosition = await listUserCVsByPosition();

  const totalCVs = Object.values(cvsByPosition).reduce((sum, cvs) => sum + cvs.length, 0);
  const totalSize = Object.values(cvsByPosition)
    .flat()
    .reduce((sum, cv) => sum + (cv.size || 0), 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
              <Briefcase className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">CV Library</h1>
              <p className="text-sm text-muted-foreground">
                All your generated CVs in one place
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-4">
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 px-4 py-3">
              <p className="text-sm text-muted-foreground">Total CVs</p>
              <p className="text-2xl font-bold text-indigo-600">{totalCVs}</p>
            </div>
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 px-4 py-3">
              <p className="text-sm text-muted-foreground">Storage Used</p>
              <p className="text-2xl font-bold text-teal-600">
                {(totalSize / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
        </div>

        {/* CV Groups */}
        {Object.keys(cvsByPosition).length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-stone-300 dark:text-stone-700" />
            <h2 className="text-xl font-semibold mb-2">No CVs Yet</h2>
            <p className="text-muted-foreground mb-4">
              Generate your first tailored CV from a job application
            </p>
            <Button asChild>
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </div>
        ) : (
          <CVLibraryClient initialData={cvsByPosition} />
        )}
      </div>
    </div>
  );
}
