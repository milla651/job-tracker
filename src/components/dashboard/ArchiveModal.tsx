"use client";

import { JobApplication, JobStatus } from "@/lib/db-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KanbanJobCard } from "./KanbanJobCard";
import { Button } from "@/components/ui/button";
import { X, Archive, RotateCcw, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { useState } from "react";

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  archivedJobs: JobApplication[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, jobId: string) => void;
}

export function ArchiveModal({
  isOpen,
  onClose,
  archivedJobs,
  onDragStart,
}: ArchiveModalProps) {
  const [searchFilter, setSearchFilter] = useState("");

  const filteredArchived = archivedJobs.filter(
    (job) =>
      job.company.toLowerCase().includes(searchFilter.toLowerCase()) ||
      job.position.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  const rejectedCount = archivedJobs.filter(
    (j) => j.status === "REJECTED",
  ).length;
  const withdrawnCount = archivedJobs.filter(
    (j) => j.status === "WITHDRAWN",
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border/50">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">
                Archived Applications
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {archivedJobs.length} total • {rejectedCount} rejected •{" "}
                {withdrawnCount} withdrawn
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-border/50 bg-muted/20">
          <Input
            placeholder="Search archived applications..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="h-9 bg-background/50"
          />
        </div>

        <ScrollArea className="flex-1 p-6">
          {filteredArchived.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2 py-20">
              <Archive className="w-12 h-12 opacity-20" />
              <p className="font-medium">
                {searchFilter
                  ? "No archived applications match your search"
                  : "No archived applications"}
              </p>
              <p className="text-sm">
                {searchFilter
                  ? "Try adjusting your search"
                  : "Archived items will appear here"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArchived.map((job) => (
                <div
                  key={job.id}
                  className="relative group opacity-75 hover:opacity-100 transition-opacity">
                  <KanbanJobCard job={job} onDragStart={onDragStart} />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/60 backdrop-blur-sm text-xs font-medium border border-border/50">
                      {job.status === "REJECTED" ? (
                        <>
                          <Trash2 className="w-3 h-3" />
                          Rejected
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" />
                          Withdrawn
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer Stats */}
        {archivedJobs.length > 0 && (
          <div className="p-4 border-t border-border/50 bg-muted/20 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredArchived.length} of {archivedJobs.length}{" "}
              archived
            </p>
            <p className="text-xs text-muted-foreground">
              Drag to Pipeline to restore
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
