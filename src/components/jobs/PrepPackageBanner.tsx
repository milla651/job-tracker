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
      <div className="ai-panel ai-glow-ring group flex items-center gap-4 p-4 hover:border-ai-glow/40 hover:shadow-md hover:shadow-primary/8 transition-all duration-200 cursor-pointer">
        {/* Icon */}
        <div className="shrink-0 h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          {hasPrepPackage ? (
            <BookOpen className="h-5 w-5 text-primary" />
          ) : (
            <Sparkles className="h-5 w-5 text-primary" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ai-foreground">
            {hasPrepPackage ? "Interview prep package ready" : "Generate interview prep"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {hasPrepPackage
              ? "Predicted questions, STAR story matches & company research"
              : "AI-powered questions, story matching and company deep-dive"}
          </p>
        </div>

        {/* Arrow */}
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </div>
    </Link>
  );
}
