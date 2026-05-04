"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Trash2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { formatDate, formatBytes } from "@/lib/utils";
import { deleteCV } from "@/app/actions/cv-reuse";
import { toast } from "sonner";
import Link from "next/link";

interface CV {
  id: string;
  name: string;
  size: number;
  createdAt: Date | string;
  company: string;
  jobId: string;
  filePath: string;
}

interface CVLibraryClientProps {
  initialData: Record<string, CV[]>;
}

export function CVLibraryClient({ initialData }: CVLibraryClientProps) {
  const [expandedPositions, setExpandedPositions] = useState<Set<string>>(new Set());
  const [cvs, setCVs] = useState(initialData);

  const togglePosition = (position: string) => {
    const newSet = new Set(expandedPositions);
    if (newSet.has(position)) {
      newSet.delete(position);
    } else {
      newSet.add(position);
    }
    setExpandedPositions(newSet);
  };

  const handleDelete = async (documentId: string, position: string) => {
    if (!confirm("Delete this CV? This cannot be undone.")) return;

    const result = await deleteCV(documentId);

    if (result.success) {
      // Update local state
      const updated = { ...cvs };
      updated[position] = updated[position].filter((cv) => cv.id !== documentId);
      if (updated[position].length === 0) {
        delete updated[position];
      }
      setCVs(updated);
      toast.success("CV deleted");
    } else {
      toast.error(result.error || "Failed to delete");
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const PYTHON_BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:5000";
      window.open(`${PYTHON_BACKEND_URL}/api/files/cv/${documentId}`, "_blank");
    } catch {
      toast.error("Failed to download");
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(cvs).map(([position, cvList]) => (
        <Card key={position} className="overflow-hidden">
          {/* Position Header */}
          <button
            onClick={() => togglePosition(position)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <div className="text-left">
                <h2 className="font-semibold text-lg">{position}</h2>
                <p className="text-sm text-muted-foreground">
                  {cvList.length} CV{cvList.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            {expandedPositions.has(position) ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {/* CV List */}
          {expandedPositions.has(position) && (
            <div className="border-t border-stone-200 dark:border-stone-800 p-4 space-y-3">
              {cvList.map((cv) => (
                <div
                  key={cv.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-stone-400 shrink-0" />
                      <h3 className="font-medium truncate">{cv.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      For: <span className="font-medium">{cv.company}</span>
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>{formatDate(cv.createdAt)}</span>
                      <span>•</span>
                      <span>{formatBytes(cv.size)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/dashboard/jobs/${cv.jobId}`}>
                      <Button variant="ghost" size="sm" title="View job">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(cv.id, cv.name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cv.id, position)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
