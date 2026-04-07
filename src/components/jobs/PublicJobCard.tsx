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
      "group relative flex flex-col bg-card border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-px",
      isSaved   ? "border-primary/40"   :
      isApplied ? "border-success/40"   :
                  "border-border hover:border-primary/30"
    )}>

      {/* Discard button */}
      <button
        onClick={() => handleAction("DISCARDED")}
        disabled={!isIdle || isPending}
        title="Hide this job"
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 z-10 h-7 w-7 flex items-center justify-center rounded-full bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all shadow-sm"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Header */}
        <div className="pr-7">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/80 to-gradient-2 flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground truncate font-medium">{job.company}</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground whitespace-nowrap shrink-0">
              {new Date(job.postedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-2 text-xs text-muted-foreground">
          {job.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{job.location}</span>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5 text-primary/60 shrink-0" />
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
                ? "bg-primary/8 border-primary/30 text-primary"
                : isApplied
                ? "bg-success/8 border-success/30 text-success"
                : "hover:bg-primary/8 hover:border-primary/20 hover:text-primary"
            )}
            onClick={() => handleAction("WISHLIST")}
            disabled={!isIdle || isPending}
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            {isSaved ? "Saved" : isApplied ? "Applied" : "Save"}
          </Button>
          <Button
            size="sm"
            className="flex-[1.4] text-xs gap-1.5 shadow-sm shadow-primary/20"
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
