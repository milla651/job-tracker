"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Building2, Timer, Coins, ArrowUpRight, Sparkles, Check, X } from "lucide-react";
import { ScrapedJob } from "@/lib/mock-jobs";
import { formatSalary } from "@/lib/utils";
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

            <div className="p-6 flex flex-col h-full gap-4">
                {/* Header */}
                <div className="flex justify-between items-start gap-4 pr-6">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="w-4 h-4" />
                            <span className="font-medium text-sm">{job.company}</span>
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-1">{job.location || "Remote"}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Workload</span>
                            <div className="flex items-center gap-2 font-medium text-sm">
                                <Timer className="w-4 h-4 text-primary" />
                                {job.type}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Salary</span>
                            <div className="flex items-center gap-2 font-medium text-sm">
                                <Coins className="w-4 h-4 text-primary" />
                                {job.salary}
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
                            "Save for Later"
                        )}
                    </Button>
                    <Button
                        className={cn(
                            "flex-1 gap-2 bg-gradient-brand shadow-md hover:shadow-lg transition-all",
                            status === 'APPLIED' && "bg-green-600 hover:bg-green-700"
                        )}
                        onClick={() => handleAction('APPLIED')}
                        disabled={status !== 'IDLE' || isPending}
                    >
                        {status === 'APPLIED' ? (
                            <>
                                <Check className="w-4 h-4" />
                                Applied
                            </>
                        ) : (
                            <>
                                Apply Now
                                <ArrowUpRight className="w-4 h-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
