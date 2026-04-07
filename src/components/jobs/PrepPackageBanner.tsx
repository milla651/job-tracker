import Link from "next/link";
import { BookOpen, ChevronRight, Sparkles } from "lucide-react";
import type { JobStatus } from "@prisma/client";

const INTERVIEW_STAGES: JobStatus[] = ["PHONE_SCREEN", "INTERVIEW", "TECHNICAL"];

interface PrepPackageBannerProps {
  jobId: string;
  status: JobStatus;
  hasPrepPackage: boolean;
}

export function PrepPackageBanner({ jobId, status, hasPrepPackage }: PrepPackageBannerProps) {
  if (!INTERVIEW_STAGES.includes(status)) return null;

  return (
    <Link href={`/dashboard/jobs/${jobId}/prep`}>
      <div className="group flex items-center gap-4 p-4 rounded-2xl border border-teal-200/70 dark:border-teal-800/70 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 hover:border-teal-400/80 dark:hover:border-teal-600/80 hover:shadow-md hover:shadow-teal-500/10 transition-all duration-200 cursor-pointer">
        {/* Icon */}
        <div className="shrink-0 h-10 w-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
          {hasPrepPackage ? (
            <BookOpen className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          ) : (
            <Sparkles className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">
            {hasPrepPackage ? "Interview prep package ready" : "Generate interview prep"}
          </p>
          <p className="text-xs text-teal-600/70 dark:text-teal-400/70 mt-0.5">
            {hasPrepPackage
              ? "Predicted questions, STAR story matches & company research"
              : "AI-powered questions, story matching and company deep-dive"}
          </p>
        </div>

        {/* Arrow */}
        <ChevronRight className="h-4 w-4 text-teal-400 group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors shrink-0" />
      </div>
    </Link>
  );
}
