"use client";

import { Button } from "@/components/ui/button";
import { MapPin, Building2, Timer, Coins, ArrowUpRight, Sparkles, X } from "lucide-react";
import { ScrapedJob } from "@/lib/mock-jobs";
import { savePublicJob } from "@/app/actions/public-jobs";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PublicJobCardProps {
  job: ScrapedJob;
  initialStatus?: "IDLE" | "WISHLIST" | "APPLIED" | "DISCARDED";
  onDiscard?: () => void;
}

export function PublicJobCard({ job, initialStatus = "IDLE", onDiscard }: PublicJobCardProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  const handleAction = (type: "WISHLIST" | "APPLIED" | "DISCARDED") => {
    startTransition(async () => {
      const result = await savePublicJob(job, type);

      if (result?.error === "Unauthorized") {
        router.push("/login?callbackUrl=/dashboard/explore");
        return;
      }
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      setStatus(type);

      if (type === "DISCARDED") {
        toast.success("Job hidden");
        setIsVisible(false);
        onDiscard?.();
        router.refresh();
      } else if (result.jobId) {
        toast.success(type === "WISHLIST" ? "Saved — opening tracker…" : "Tracked — opening now…");
        router.push(`/dashboard/jobs/${result.jobId}`);
      } else {
        toast.success(type === "WISHLIST" ? "Added to wishlist" : "Application tracked");
      }
    });
  };

  if (!isVisible) return null;

  const isSaved   = status === "WISHLIST";
  const isApplied = status === "APPLIED";
  const isIdle    = status === "IDLE";

  return (
    <div className={cn(
      "group relative flex flex-col bg-white dark:bg-stone-900 border rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-px",
      isSaved   ? "border-indigo-200 dark:border-indigo-800/60"   :
      isApplied ? "border-teal-200  dark:border-teal-800/60"      :
                  "border-stone-200 dark:border-stone-800 hover:border-indigo-200 dark:hover:border-indigo-800/50"
    )}>

      {/* Discard button */}
      <button
        onClick={() => handleAction("DISCARDED")}
        disabled={!isIdle || isPending}
        title="Hide this job"
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 z-10 h-7 w-7 flex items-center justify-center rounded-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-700 transition-all shadow-sm"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Header */}
        <div className="pr-7">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-50 leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {job.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Building2 className="h-3 w-3 text-stone-400 shrink-0" />
                <span className="text-xs text-stone-500 truncate font-medium">{job.company}</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-stone-400 whitespace-nowrap shrink-0">
              {new Date(job.postedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-2 text-xs text-stone-500">
          {job.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-stone-400" />
              <span className="truncate">{job.location}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span>{job.type}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{job.salary}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "flex-1 text-xs gap-1.5 transition-colors",
              isSaved
                ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                : isApplied
                ? "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300"
                : "hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-800 hover:text-indigo-700 dark:hover:text-indigo-300"
            )}
            onClick={() => handleAction("WISHLIST")}
            disabled={!isIdle || isPending}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            {isSaved ? "Saved" : isApplied ? "Applied" : "Save"}
          </Button>
          <Button
            size="sm"
            className="flex-[1.4] text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/25"
            onClick={() => router.push(`/dashboard/explore/${job.id}`)}
          >
            View details
            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
          </Button>
        </div>
      </div>
    </div>
  );
}
