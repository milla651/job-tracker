"use client";

import { Button } from "@/components/ui/button";
import { Check, Sparkles, ArrowUpRight } from "lucide-react";
import { ScrapedJob } from "@/lib/mock-jobs";
import { savePublicJob } from "@/app/actions/public-jobs";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { SmartApplyModal } from "./SmartApplyModal";

interface JobActionButtonsProps {
  job: ScrapedJob;
  initialStatus?: "IDLE" | "WISHLIST" | "APPLIED" | "DISCARDED";
  compact?: boolean;
}

export function JobActionButtons({ job, initialStatus = "IDLE", compact = false }: JobActionButtonsProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  const handleAction = async (type: "WISHLIST" | "APPLIED") => {
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
      toast.success(
        type === "WISHLIST" ? "Saved to Wishlist" : "Application Tracked successfully!"
      );
      router.refresh();
    });
  };

  const handleApplyClick = () => {
    if (status === "APPLIED") return;
    setModalOpen(true);
  };

  return (
    <>
      <div className={cn("flex gap-3", compact ? "flex-col" : "flex-row")}>
        <Button
          className={cn(
            "rounded-full font-semibold transition-all shadow-sm border-2",
            status === "WISHLIST" 
              ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20" 
              : "bg-background border-border hover:bg-muted text-muted-foreground",
            compact ? "w-full py-6" : "flex-1 py-6"
          )}
          variant="ghost"
          onClick={() => handleAction("WISHLIST")}
          disabled={status !== "IDLE" || isPending}
        >
          {status === "WISHLIST" ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Saved
            </>
          ) : status === "APPLIED" ? (
            "Tracked"
          ) : (
            "Save for Later"
          )}
        </Button>

        <Button
          className={cn(
            "rounded-full font-bold gap-2 transition-all hover:-translate-y-0.5 shadow-md shadow-primary/20",
            status === "APPLIED" 
              ? "bg-green-500 hover:bg-green-600 text-white shadow-green-500/20" 
              : "bg-primary hover:bg-primary/90 text-primary-foreground",
            compact ? "w-full py-6" : "flex-[1.5] py-6"
          )}
          onClick={handleApplyClick}
          disabled={status !== "IDLE" || isPending}
        >
          {status === "APPLIED" ? (
            <>
              <Check className="w-5 h-5" />
              Applied
            </>
          ) : (
            <>
              Track Application
              <Check className="w-5 h-5 hidden sm:block opacity-70" />
            </>
          )}
        </Button>
      </div>

      <SmartApplyModal 
        job={job} 
        isOpen={modalOpen} 
        setIsOpen={setModalOpen} 
        onSuccess={() => setStatus("APPLIED")} 
      />
    </>
  );
}
