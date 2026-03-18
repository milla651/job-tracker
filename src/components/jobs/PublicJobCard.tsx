"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Building2, Timer, Coins, ArrowUpRight, Sparkles, Check, X } from "lucide-react";
import { ScrapedJob } from "@/lib/mock-jobs";
// import { formatSalary } from "@/lib/utils";
import { savePublicJob } from "@/app/actions/public-jobs";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PublicJobCardProps {
    job: ScrapedJob;
    initialStatus?: 'IDLE' | 'WISHLIST' | 'APPLIED' | 'DISCARDED';
    onDiscard?: () => void;
}

export function PublicJobCard({ job, initialStatus = 'IDLE', onDiscard }: PublicJobCardProps) {
    const [status, setStatus] = useState(initialStatus);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);

    const handleAction = async (type: 'WISHLIST' | 'APPLIED' | 'DISCARDED') => {
        startTransition(async () => {
            const result = await savePublicJob(job, type);

            if (result?.error === "Unauthorized") {
                router.push("/login?callbackUrl=/jobs");
                return;
            }

            if (result?.error) {
                toast.error(result.error);
                return;
            }

            setStatus(type);

            if (type === 'DISCARDED') {
                toast.success("Job discarded");
                setIsVisible(false);
                if (onDiscard) onDiscard();
                router.refresh();
            } else {
                toast.success(
                    type === 'WISHLIST'
                        ? "Added to Wishlist"
                        : "Application Tracked"
                );
            }
        });
    };

    if (!isVisible) return null;

    return (
        <Card className="group relative overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/20">
            {/* Discard Button */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => handleAction('DISCARDED')}
                    disabled={status !== 'IDLE' || isPending}
                    title="Discard job"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="p-6 flex flex-col h-full gap-4 max-w-full">
                {/* Header */}
                <div className="flex justify-between items-start gap-4 pr-6 w-full relative">
                    <div className="space-y-1 min-w-0 flex-1 pr-16">
                        <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 break-all text-wrap">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground w-full">
                            <Building2 className="w-4 h-4 shrink-0" />
                            <span className="font-medium text-sm truncate">{job.company}</span>
                        </div>
                    </div>
                    {/* Date Badge */}
                    <div className="absolute top-0 right-0 h-full hidden sm:block">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 bg-muted/40 px-2 py-1 rounded-md whitespace-nowrap">
                            {new Date(job.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-3 min-w-0 w-full overflow-hidden">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground w-full">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{job.location || "Remote"}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 min-w-0 w-full">
                        <div className="space-y-1 min-w-0">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Workload</span>
                            <div className="flex items-center gap-2 font-medium text-sm w-full">
                                <Timer className="w-4 h-4 text-primary shrink-0" />
                                <span className="truncate">{job.type}</span>
                            </div>
                        </div>
                        <div className="space-y-1 min-w-0">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Salary</span>
                            <div className="flex items-center gap-2 font-medium text-sm w-full">
                                <Coins className="w-4 h-4 text-primary shrink-0" />
                                <span className="truncate">{job.salary}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-4 flex gap-3">
                    <Button
                        className={cn(
                            "flex-1 bg-primary/10 hover:bg-primary/20 text-primary border-0 shadow-none transition-colors",
                            status === 'WISHLIST' && "bg-primary/20"
                        )}
                        variant="outline"
                        onClick={() => handleAction('WISHLIST')}
                        disabled={status !== 'IDLE' || isPending}
                    >
                        {status === 'WISHLIST' ? (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Saved
                            </>
                        ) : status === 'APPLIED' ? (
                            "Applied"
                        ) : (
                            "Save"
                        )}
                    </Button>
                    <Button
                        className="flex-[1.5] gap-2 bg-gradient-brand shadow-md hover:shadow-lg transition-all"
                        onClick={() => router.push(`/dashboard/explore/${job.id}`)}
                    >
                        View Details
                        <ArrowUpRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
