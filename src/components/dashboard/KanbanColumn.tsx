"use client";

import { JobApplication, JobStatus } from "@prisma/client";
import { KanbanJobCard } from "./KanbanJobCard";
import { cn } from "@/lib/utils";
import { useState } from "react";

import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanColumnProps {
    id: string; // This corresponds to the status or group ID
    title: string;
    jobs: JobApplication[];
    status: JobStatus | "ARCHIVE";
    onDragStart: (e: React.DragEvent<HTMLDivElement>, jobId: string) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, status: JobStatus | "ARCHIVE") => void;
    color?: string;
    icon?: React.ReactNode;
}

export function KanbanColumn({
    id,
    title,
    jobs,
    status,
    onDragStart,
    onDrop,
    color = "bg-muted",
    icon,
}: KanbanColumnProps) {
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
        onDrop(e, status);
    };

    const isArchive = status === "ARCHIVE";

    return (
        <div className="flex flex-col h-full min-w-[300px] w-[300px] rounded-2xl bg-muted/30 border border-border/40 flex-shrink-0">
            {/* Column Header */}
            <div className="p-4 flex items-center justify-between sticky top-0 bg-transparent z-10">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-3 h-3 rounded-full",
                        color.replace('bg-', 'bg-').replace('/20', '') // Hacky way to get solid color if passed bg is transparent
                    )} />
                    <h3 className="font-semibold text-sm text-foreground">{title}</h3>
                    <span className="text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full border border-border/50">
                        {jobs.length}
                    </span>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                        <Plus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Column Content / Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "flex-1 p-3 flex flex-col gap-3 overflow-y-auto min-h-[150px] transition-colors rounded-b-2xl",
                    isOver ? "bg-primary/5 ring-2 ring-inset ring-primary/20" : "",
                    isArchive ? "border-2 border-dashed border-destructive/20 bg-destructive/5 justify-center items-center text-center" : ""
                )}
            >
                {isArchive ? (
                    <div className="text-muted-foreground pointer-events-none">
                        <p className="text-sm font-medium">Archive Application</p>
                        <p className="text-xs mt-1 opacity-70">Drag in here to archive applications</p>
                    </div>
                ) : (
                    <>
                        {jobs.map((job) => (
                            <KanbanJobCard key={job.id} job={job} onDragStart={onDragStart} />
                        ))}
                        {jobs.length === 0 && !isOver && (
                            <div className="h-full flex items-center justify-center text-muted-foreground/30 text-sm italic">
                                No jobs
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
