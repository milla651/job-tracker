"use client";

import { useState, useTransition } from "react";
import { JobApplication, JobStatus } from "@prisma/client";
import { KanbanColumn } from "./KanbanColumn";
import { updateJobStatus } from "@/app/actions/jobs"; // We need to make sure this action is robust
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArchiveModal } from "./ArchiveModal";

interface KanbanBoardProps {
    initialJobs: JobApplication[];
}

export function KanbanBoard({ initialJobs }: KanbanBoardProps) {
    const [jobs, setJobs] = useState<JobApplication[]>(initialJobs);
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isDragOverArchive, setIsDragOverArchive] = useState(false);
    const router = useRouter();

    // Define columns mapping
    const columns: { id: string; title: string; status: JobStatus; color: string }[] = [
        { id: "wishlist", title: "Wishlist", status: "WISHLIST", color: "bg-yellow-500" },
        { id: "applied", title: "Applied", status: "APPLIED", color: "bg-blue-500" },
        { id: "interview", title: "Interview", status: "INTERVIEW", color: "bg-orange-500" },
        { id: "offer", title: "Offered", status: "OFFER", color: "bg-emerald-500" },
        { id: "accepted", title: "Accepted", status: "ACCEPTED", color: "bg-green-500" },
    ];

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, jobId: string) => {
        e.dataTransfer.setData("jobId", jobId);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, status: JobStatus | "ARCHIVE") => {
        e.preventDefault();
        setIsDragOverArchive(false);
        const jobId = e.dataTransfer.getData("jobId");
        if (!jobId) return;

        const job = jobs.find((j) => j.id === jobId);
        if (!job) return;

        // Determine new status
        let newStatus: JobStatus;
        if (status === "ARCHIVE") {
            newStatus = "WITHDRAWN"; // defaulting to WITHDRAWN for "Archive" purpose
        } else {
            newStatus = status;
        }

        if (job.status === newStatus) return;

        // Optimistic update
        const updatedJobs = jobs.map((j) =>
            j.id === jobId ? { ...j, status: newStatus } : j
        );
        setJobs(updatedJobs);

        if (status === "ARCHIVE") {
            toast.success("Job archived");
        } else {
            toast.success(`Moved to ${status}`);
        }

        startTransition(async () => {
            try {
                await updateJobStatus(jobId, newStatus);
                router.refresh();
            } catch (error) {
                toast.error("Failed to update job status");
                // Revert on error
                setJobs(initialJobs);
            }
        });
    };

    const handleDragOverArchive = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOverArchive(true);
    };

    const handleDragLeaveArchive = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOverArchive(false);
    };

    // Helper to filter jobs for columns
    const getJobsForStatus = (status: JobStatus) => {
        if (status === "INTERVIEW") {
            return jobs.filter(j =>
                j.status === "INTERVIEW" ||
                j.status === "PHONE_SCREEN" ||
                j.status === "TECHNICAL"
            );
        }
        return jobs.filter(j => j.status === status);
    };

    const archivedJobs = jobs.filter(j => j.status === "WITHDRAWN" || j.status === "REJECTED" || (j.status as any) === "DISCARDED");
    const activeJobsCount = jobs.length - archivedJobs.length;

    return (
        <>
            <div className="flex h-full gap-6 overflow-x-auto pb-4 pt-2 px-4 snap-x snap-mandatory items-start justify-center">
                {columns.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        status={col.status}
                        jobs={getJobsForStatus(col.status)}
                        color={col.color}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                    />
                ))}
            </div>

            {/* Archive FAB / Drop Zone */}
            <div
                className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${isDragOverArchive ? 'scale-105' : 'scale-100'}`}
                onDragOver={handleDragOverArchive}
                onDragLeave={handleDragLeaveArchive}
                onDrop={(e) => handleDrop(e, "ARCHIVE")}
            >
                <Button
                    size="lg"
                    className={`h-14 rounded-full shadow-xl flex items-center justify-center gap-2 px-6 transition-all ${isDragOverArchive
                        ? 'bg-destructive text-destructive-foreground'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}
                    onClick={() => setIsArchiveOpen(true)}
                >
                    {isDragOverArchive ? (
                        <>
                            <Archive className="w-5 h-5 animate-bounce" />
                            <span className="font-semibold text-base">Drop to Archive</span>
                        </>
                    ) : (
                        <>
                            <Archive className="w-5 h-5" />
                            <span className="font-semibold text-base">Archive</span>
                        </>
                    )}
                </Button>
            </div>

            <ArchiveModal
                isOpen={isArchiveOpen}
                onClose={() => setIsArchiveOpen(false)}
                archivedJobs={archivedJobs}
                onDragStart={handleDragStart}
            />
        </>
    );
}


