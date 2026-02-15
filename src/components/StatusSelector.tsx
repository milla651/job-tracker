"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { updateJobStatus } from "@/app/actions/jobs";
import { JobStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { ChevronDown, Check, Loader2 } from "lucide-react";

interface StatusSelectorProps {
  jobId: string;
  currentStatus: JobStatus;
}

const allStatuses: JobStatus[] = [
  "WISHLIST",
  "APPLIED",
  "PHONE_SCREEN",
  "INTERVIEW",
  "TECHNICAL",
  "OFFER",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
];

export function StatusSelector({ jobId, currentStatus }: StatusSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(newStatus: JobStatus) {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      await updateJobStatus(jobId, newStatus);
      setIsOpen(false);
    });
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="min-w-[200px] justify-between"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="ml-2">Updating...</span>
          </>
        ) : (
          <>
            <StatusBadge status={currentStatus} />
            <ChevronDown
              className={cn(
                "w-4 h-4 ml-2 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute z-50 mt-2 w-64 rounded-lg border border-gray-700 bg-gray-900 shadow-xl overflow-hidden">
            <div className="py-2">
              {allStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={cn(
                    "w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-800 transition-colors",
                    status === currentStatus && "bg-gray-800/50"
                  )}
                >
                  <StatusBadge status={status} />
                  {status === currentStatus && (
                    <Check className="w-4 h-4 text-indigo-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
