"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2, CheckCircle2, ChevronRight, FileText, ArrowUpRight } from "lucide-react";
import { ScrapedJob } from "@/lib/mock-jobs";
import { savePublicJob } from "@/app/actions/public-jobs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SmartApplyModalProps {
  job: ScrapedJob;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess?: () => void;
}

export function SmartApplyModal({ job, isOpen, setIsOpen, onSuccess }: SmartApplyModalProps) {
  const [step, setStep] = useState<"IDLE" | "GENERATING" | "READY" | "APPLYING">("IDLE");
  const [matchScore, setMatchScore] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("IDLE");
      // Simulate calculating a personalized match score based on job description
      setMatchScore(Math.floor(Math.random() * (95 - 75 + 1) + 75));
    }
  }, [isOpen]);

  const handleGenerate = () => {
    setStep("GENERATING");
    // Simulate AI generation time for Cover Letter
    setTimeout(() => {
      setStep("READY");
    }, 2500);
  };

  const handleApply = () => {
    setStep("APPLYING");
    startTransition(async () => {
      const result = await savePublicJob(job, "APPLIED");
      
      if (result?.error === "Unauthorized") {
        router.push("/login?callbackUrl=/dashboard/explore");
        return;
      }

      if (result?.error) {
        toast.error(result.error);
        setStep("READY");
        return;
      }

      toast.success("Application tracked in Pipeline!");
      if (onSuccess) onSuccess();
      
      // Open the real job url in a new tab so they can actually apply
      if (job.url) {
        window.open(job.url, "_blank", "noopener,noreferrer");
      }
      
      // Route the current window to the pipeline
      router.push("/dashboard/pipeline");
      setIsOpen(false);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-background border-border/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="p-6 relative z-10">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-primary" />
              Smart Application
            </DialogTitle>
            <DialogDescription className="text-base mt-2">
              We&apos;ll auto-generate a tailored cover letter and track this directly in your Pipeline.
            </DialogDescription>
          </DialogHeader>

          {step === "IDLE" && (
            <div className="space-y-6 fade-in">
               <div className="glass-card p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="font-medium text-foreground">Profile Match</p>
                    <p className="text-sm text-muted-foreground">Based on your saved resume skills</p>
                 </div>
                 <div className="text-2xl font-bold text-primary">{matchScore}%</div>
               </div>
               
               <div className="space-y-3">
                 <h4 className="font-medium text-sm text-foreground">What happens next:</h4>
                 <ul className="text-sm text-muted-foreground space-y-2">
                   <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0"/> We analyze the {job.company} requirements.</li>
                   <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0"/> A bespoke cover letter is generated.</li>
                   <li className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0"/> The job is moved to your Kanban pipeline.</li>
                 </ul>
               </div>

               <Button 
                className="w-full rounded-xl py-6 bg-gradient-brand hover:shadow-lg transition-all text-white font-semibold text-base"
                onClick={handleGenerate}
               >
                 Generate Materials <ChevronRight className="w-5 h-5 ml-2" />
               </Button>
            </div>
          )}

          {step === "GENERATING" && (
             <div className="py-12 flex flex-col items-center justify-center space-y-4 fade-in">
               <div className="relative">
                 <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                 <Wand2 className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
               </div>
               <div className="text-center space-y-1">
                 <p className="font-semibold text-foreground text-lg">Analyzing job description...</p>
                 <p className="text-sm text-muted-foreground">Tailoring cover letter for {job.company}.</p>
               </div>
             </div>
          )}

          {step === "READY" && (
            <div className="space-y-6 fade-in">
               <div className="flex flex-col items-center text-center space-y-3 mb-2">
                 <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-1">
                   <CheckCircle2 className="w-7 h-7 text-green-500" />
                 </div>
                 <h3 className="text-xl font-bold text-foreground">Materials Generated!</h3>
                 <p className="text-sm text-muted-foreground">Your custom cover letter is ready and saved to your profile.</p>
               </div>

               <div className="glass-card p-4 rounded-xl border border-border flex items-center gap-3 bg-muted/30">
                 <div className="p-2 bg-background rounded-lg shadow-sm border border-border/50">
                   <FileText className="w-5 h-5 text-primary" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">CoverLetter_{job.company.replace(/\s+/g, '')}.pdf</p>
                    <p className="text-xs text-muted-foreground">Ready to copy/paste</p>
                 </div>
                 <Button variant="ghost" size="sm" className="h-8 text-xs font-medium">View</Button>
               </div>

               <Button 
                className={cn(
                  "w-full rounded-xl py-6 transition-all font-semibold text-base gap-2 shadow-lg",
                  "bg-green-600 hover:bg-green-700 text-white shadow-green-600/20 hover:-translate-y-0.5"
                )}
                onClick={handleApply}
                disabled={isPending}
               >
                 Go Apply & Move to Pipeline <ArrowUpRight className="w-5 h-5" />
               </Button>
            </div>
          )}

          {step === "APPLYING" && (
             <div className="py-12 flex flex-col items-center justify-center space-y-4 fade-in">
               <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
               <p className="font-semibold text-foreground text-lg">Routing to Pipeline...</p>
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
