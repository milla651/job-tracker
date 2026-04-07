"use client";

import { JobApplication } from "@prisma/client";
import { AiScoreBadge } from "@/components/ai/AiScoreBadge";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertCircle, ClipboardCheck, DollarSign } from "lucide-react";
import type { AiScore } from "@prisma/client";

interface KanbanJobCardProps {
  job: JobApplication;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, jobId: string) => void;
}

const STALE_DAYS = 14;
const FOLLOW_UP_DAYS = 7;

export function KanbanJobCard({ job, onDragStart }: KanbanJobCardProps) {
  const daysSince = differenceInDays(new Date(), new Date(job.updatedAt));
  const isStale = daysSince >= STALE_DAYS;
  const needsFollowUp = job.status === "APPLIED" && daysSince >= FOLLOW_UP_DAYS;
  const isInterview = ["PHONE_SCREEN", "INTERVIEW", "TECHNICAL"].includes(job.status);
  const isOffer = job.status === "OFFER";
  const isAccepted = job.status === "ACCEPTED";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      draggable
      onDragStart={(e) => {
        // @ts-expect-error framer motion drag event compat
        onDragStart(e, job.id);
      }}
      className={cn(
        "group relative bg-card border rounded-xl p-3.5 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all duration-200",
        isStale && !isAccepted
          ? "border-orange-200 dark:border-orange-900/60"
          : isOffer
          ? "border-emerald-200 dark:border-emerald-800/60"
          : isInterview
          ? "border-amber-200 dark:border-amber-800/40"
          : "border-border hover:border-border-strong",
      )}
    >
      {/* Urgency bar */}
      {(isStale || needsFollowUp) && !isAccepted && (
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-orange-400 dark:bg-orange-500" />
      )}

      <div className="flex flex-col gap-2.5">
        {/* Header row */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {job.position}
            </p>
            <p className="text-xs text-muted-foreground font-medium line-clamp-1">
              {job.company}
            </p>
          </div>
          <AiScoreBadge score={job.aiScore as AiScore} size="sm" />
        </div>

        {/* Meta tags */}
        <div className="flex flex-wrap gap-1.5">
          {job.location && (
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md truncate max-w-[100px]">
              {job.location}
            </span>
          )}
          {job.salaryMax && (
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <DollarSign className="h-2.5 w-2.5" />
              {Math.round(job.salaryMax / 1000)}k
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true })}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Stale / follow-up warning */}
            {(isStale || needsFollowUp) && !isAccepted && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-orange-500 bg-orange-50 dark:bg-orange-950/30 px-1.5 py-0.5 rounded-full">
                <AlertCircle className="h-2.5 w-2.5" />
                {needsFollowUp ? "Follow up" : `${daysSince}d stale`}
              </span>
            )}

            {/* Prep indicator */}
            {isInterview && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                <ClipboardCheck className="h-2.5 w-2.5" />
                Prep
              </span>
            )}

            {/* Accepted badge */}
            {isAccepted && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-full">
                HIRED ✓
              </span>
            )}

            {/* Offer badge */}
            {isOffer && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-full">
                OFFER
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
