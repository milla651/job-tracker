"use client";

import { PipelineStat } from "@/app/actions/analytics";
import { JobStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface PipelineFunnelProps {
    data: PipelineStat[];
}

const STATUS_ORDER: JobStatus[] = [
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

const STATUS_LABELS: Record<JobStatus, string> = {
    WISHLIST: "Wishlist",
    APPLIED: "Applied",
    PHONE_SCREEN: "Phone Screen",
    INTERVIEW: "Interview",
    TECHNICAL: "Technical",
    OFFER: "Offer",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    WITHDRAWN: "Withdrawn",
};

export function PipelineFunnel({ data }: PipelineFunnelProps) {
    // Normalize data map
    const dataMap = new Map(data.map((item) => [item.status, item.count]));

    // Filter out zero counts if desired, or keep all to show gaps
    // Let's show only active stages + Rejected/Withdrawn if they have data
    const relevantStatuses = STATUS_ORDER.filter(s => {
        // Always show first 3 stages to encourage filling them
        if (["WISHLIST", "APPLIED"].includes(s)) return true;
        return (dataMap.get(s) || 0) > 0;
    });

    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="space-y-3">
            {relevantStatuses.map((status) => {
                const count = dataMap.get(status) || 0;
                const percentage = (count / maxCount) * 100;

                return (
                    <div key={status} className="group flex items-center gap-4">
                        <div className="w-24 text-right text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            {STATUS_LABELS[status]}
                        </div>

                        <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000 ease-out",
                                    status === "OFFER" || status === "ACCEPTED" ? "bg-gradient-to-r from-green-400 to-emerald-600" :
                                        status === "REJECTED" ? "bg-red-200 dark:bg-red-900/50" :
                                            "bg-primary/80 group-hover:bg-primary"
                                )}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>

                        <div className="w-8 text-sm font-bold text-foreground">
                            {count}
                        </div>
                    </div>
                );
            })}

            {data.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                    No data yet. Apply to your first job!
                </div>
            )}
        </div>
    );
}
