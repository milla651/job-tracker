"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { generateTailoredCV, checkCVGenerationStatus } from "@/app/actions/cv-generation";
import { getSimilarCVs } from "@/app/actions/cv-reuse";
import { SimilarCVsDialog } from "@/components/cv/SimilarCVsDialog";
import { FileText, Loader2, CheckCircle, Search } from "lucide-react";
import { toast } from "sonner";

interface GenerateCVButtonProps {
  jobApplicationId: string;
  company: string;
}

export function GenerateCVButton({ jobApplicationId, company }: GenerateCVButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [checkingSimilar, setCheckingSimilar] = useState(false);
  const [showSimilarDialog, setShowSimilarDialog] = useState(false);
  const [similarCVs, setSimilarCVs] = useState<any[]>([]);

  useEffect(() => {
    if (!taskId) return;

    const interval = setInterval(async () => {
      const result = await checkCVGenerationStatus(taskId);

      if (!result.success) {
        clearInterval(interval);
        setIsGenerating(false);
        toast.error(result.error || "Failed to check status");
        return;
      }

      setProgress(result.progress || 0);
      setStatus(result.message || "");

      if (result.status === "success" || result.status === "completed") {
        clearInterval(interval);
        setIsGenerating(false);
        setProgress(100);
        toast.success(`CV for ${company} generated successfully!`);
      } else if (result.status === "failed" || result.status === "failure") {
        clearInterval(interval);
        setIsGenerating(false);
        toast.error(result.error || "CV generation failed");
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [taskId, company]);

  const handleGenerate = async () => {
    // Step 1: Check for similar CVs first
    setCheckingSimilar(true);
    const result = await getSimilarCVs(jobApplicationId);
    setCheckingSimilar(false);

    if (result.success && result.similar.length > 0) {
      // Found similar CVs - show dialog
      setSimilarCVs(result.similar);
      setShowSimilarDialog(true);
    } else {
      // No similar CVs - generate directly
      startGeneration();
    }
  };

  const startGeneration = async () => {
    setIsGenerating(true);
    setProgress(0);
    setStatus("Starting...");

    const result = await generateTailoredCV(jobApplicationId);

    if (!result.success) {
      setIsGenerating(false);
      toast.error(result.error || "Failed to start CV generation");
      return;
    }

    setTaskId(result.taskId);
    toast.info("CV generation started...");
  };

  const handleReuse = () => {
    setProgress(100);
    // Revalidation happens in reuseCVForJob action
  };

  return (
    <>
      <SimilarCVsDialog
        isOpen={showSimilarDialog}
        onClose={() => setShowSimilarDialog(false)}
        similarCVs={similarCVs}
        currentJobId={jobApplicationId}
        onReuse={handleReuse}
        onGenerateNew={startGeneration}
      />

      <div className="space-y-2">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || checkingSimilar}
          className="w-full"
        >
          {checkingSimilar ? (
            <>
              <Search className="mr-2 h-4 w-4 animate-pulse" />
              Checking Similar CVs...
            </>
          ) : isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating ({progress}%)
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Generate Tailored CV
          </>
        )}
      </Button>

      {isGenerating && status && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>{status}</span>
        </div>
      )}

      {!isGenerating && progress === 100 && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-3 w-3" />
          <span>CV ready! Check Documents tab below.</span>
        </div>
      )}
      </div>
    </>
  );
}
