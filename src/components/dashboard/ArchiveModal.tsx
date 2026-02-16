"use client";

import { JobApplication, JobStatus } from "@prisma/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KanbanJobCard } from "./KanbanJobCard";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ArchiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    archivedJobs: JobApplication[];
    onDragStart: (e: React.DragEvent<HTMLDivElement>, jobId: string) => void;
}

export function ArchiveModal({ isOpen, onClose, archivedJobs, onDragStart }: ArchiveModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center justify-between">
                        <span>Archived Applications</span>
                        <span className="text-sm font-normal text-muted-foreground mr-8">
                            {archivedJobs.length} applications
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 pt-2">
                    {archivedJobs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2 py-20">
                            <p>No archived applications</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {archivedJobs.map((job) => (
                                <div key={job.id} className="opacity-75 hover:opacity-100 transition-opacity">
                                    <KanbanJobCard job={job} onDragStart={onDragStart} />
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
