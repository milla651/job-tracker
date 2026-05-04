"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, CheckCircle, Sparkles, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { reuseCVForJob } from "@/app/actions/cv-reuse";
import { toast } from "sonner";

interface SimilarCV {
  id: string;
  name: string;
  for_company: string;
  for_position: string;
  match_score: number;
  created_at: string;
  size: number;
}

interface SimilarCVsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  similarCVs: SimilarCV[];
  currentJobId: string;
  onReuse: () => void;
  onGenerateNew: () => void;
}

export function SimilarCVsDialog({
  isOpen,
  onClose,
  similarCVs,
  currentJobId,
  onReuse,
  onGenerateNew,
}: SimilarCVsDialogProps) {
  const [reusing, setReusing] = useState(false);

  const handleReuse = async (documentId: string, company: string) => {
    setReusing(true);

    const result = await reuseCVForJob(documentId, currentJobId);

    if (result.success) {
      toast.success(`CV reused for ${company}!`);
      onReuse();
      onClose();
    } else {
      toast.error(result.error || "Failed to reuse CV");
    }

    setReusing(false);
  };

  const getMatchColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 dark:text-green-400";
    if (score >= 0.6) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  const getMatchLabel = (score: number) => {
    if (score >= 0.8) return "Excellent match";
    if (score >= 0.6) return "Good match";
    return "Fair match";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Similar CVs Found!</h2>
                <p className="text-sm text-muted-foreground">
                  Reuse an existing CV or generate a fresh tailored one
                </p>
              </div>
            </div>
          </div>

          {/* CV List */}
          <div className="p-6 space-y-3 overflow-y-auto max-h-[400px]">
            {similarCVs.map((cv) => (
              <div
                key={cv.id}
                className="border border-stone-200 dark:border-stone-800 rounded-xl p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                      <h3 className="font-semibold truncate">{cv.for_position}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Generated for: <span className="font-medium">{cv.for_company}</span>
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(cv.created_at)}
                      </span>
                      <span className={`flex items-center gap-1 font-semibold ${getMatchColor(cv.match_score)}`}>
                        <CheckCircle className="h-3 w-3" />
                        {Math.round(cv.match_score * 100)}% match • {getMatchLabel(cv.match_score)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleReuse(cv.id, cv.for_company)}
                    disabled={reusing}
                    size="sm"
                    className="shrink-0"
                  >
                    {reusing ? "Reusing..." : "Reuse This"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-stone-200 dark:border-stone-800 space-y-3">
            <Button
              onClick={() => {
                onGenerateNew();
                onClose();
              }}
              className="w-full"
              variant="outline"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Fresh Tailored CV (~60 seconds)
            </Button>
            <Button onClick={onClose} variant="ghost" className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
