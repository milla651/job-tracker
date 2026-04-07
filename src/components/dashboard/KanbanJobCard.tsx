"use client";

import { JobApplication, JobStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { AiScoreBadge } from "@/components/ai/AiScoreBadge";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface KanbanJobCardProps {
    job: JobApplication;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, jobId: string) => void;
}

export function KanbanJobCard({ job, onDragStart }: KanbanJobCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            draggable
            onDragStart={(e) => {
                // @ts-ignore - React.DragEvent is compatible with DragEvent handlers
                onDragStart(e, job.id);
            }}
            className={cn(
                "group relative bg-card hover:bg-accent/5 border border-border/50 rounded-xl p-4 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all",
                // Status specific styling
                job.status === "WISHLIST" && "border-yellow-500/10 hover:border-yellow-500/20",
                job.status === "APPLIED" && "border-blue-500/10 hover:border-blue-500/20",
                (job.status === "INTERVIEW" || job.status === "PHONE_SCREEN" || job.status === "TECHNICAL") && "border-orange-500/10 hover:border-orange-500/20",
                job.status === "OFFER" && "border-emerald-500/10 hover:border-emerald-500/20",
                job.status === "ACCEPTED" && "border-green-500/10 hover:border-green-500/20",
            )}
        >
            <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {job.position}
                        </h4>
                        <p className="text-sm text-muted-foreground font-medium line-clamp-1">
                            {job.company}
                        </p>
                    </div>
                    <AiScoreBadge score={job.aiScore} size="sm" />
                </div>

                {/* Info */}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground/80">
                    {job.location && (
                        <span className="bg-muted px-1.5 py-0.5 rounded-md truncate max-w-[120px]">
                            {job.location}
                        </span>
                    )}
                    {job.salaryMax && (
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md">
                            {/* Simplified salary display */}
                            ${(job.salaryMax / 1000).toFixed(0)}k
                        </span>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30 mt-1">
                    <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true })}
                    </span>
                    {job.status === "ACCEPTED" && (
                        <Badge variant="outline" className="text-[10px] h-5 border-green-500/20 text-green-500 bg-green-500/5">
                            HIRED
                        </Badge>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
