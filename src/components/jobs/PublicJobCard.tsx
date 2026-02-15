"use strict";
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ScrapedJob } from "@/lib/mock-jobs";
import { savePublicJob } from "@/app/actions/public-jobs";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Clock, Building2, Heart, Plus, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns"; // fallback if postedAt is not a date
import { cn } from "@/lib/utils";

interface PublicJobCardProps {
    job: ScrapedJob;
    initialStatus?: 'IDLE' | 'WISHLIST' | 'APPLIED';
}

export function PublicJobCard({ job, initialStatus = 'IDLE' }: PublicJobCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [savedStatus, setSavedStatus] = useState<'IDLE' | 'WISHLIST' | 'APPLIED'>(initialStatus);

    const handleAction = async (type: 'WISHLIST' | 'APPLIED') => {
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

            setSavedStatus(type);
            toast.success(
                type === 'WISHLIST'
                    ? "Added to Wishlist"
                    : "Application Tracked"
            );
        });
    };

    return (
        <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/5 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="p-6 pb-4 relative">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-xl font-bold text-primary shadow-inner">
                            {job.logo}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-muted-foreground mt-1 text-sm font-medium">
                                <Building2 className="w-3.5 h-3.5" />
                                {job.company}
                            </div>
                        </div>
                    </div>
                    {/* Posted time badge */}
                    <Badge variant="secondary" className="bg-muted/50 text-xs font-normal">
                        {job.postedAt}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-6 py-2 relative">
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
                        <MapPin className="w-3.5 h-3.5 text-primary/70" />
                        {job.location}
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
                        <DollarSign className="w-3.5 h-3.5 text-green-500/70" />
                        {job.salary}
                    </div>
                    <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-amber-500/70" />
                        {job.type}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                    {job.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-primary/20 text-primary/80 bg-primary/5">
                            {tag}
                        </Badge>
                    ))}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mt-3 leading-relaxed">
                    {job.description}
                </p>
            </CardContent>

            <CardFooter className="p-6 pt-4 flex gap-3 relative">
                <Button
                    variant="outline"
                    className={cn(
                        "flex-1 gap-2 transition-all",
                        savedStatus === 'WISHLIST' && "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                    onClick={() => handleAction('WISHLIST')}
                    disabled={isPending || savedStatus !== 'IDLE'}
                >
                    {savedStatus === 'WISHLIST' ? (
                        <>
                            <Check className="w-4 h-4" /> Saved
                        </>
                    ) : (
                        <>
                            <Heart className={cn("w-4 h-4", isPending && "animate-pulse")} />
                            {isPending ? "Saving..." : "Wishlist"}
                        </>
                    )}
                </Button>

                <Button
                    className={cn(
                        "flex-1 gap-2 bg-gradient-brand shadow-md hover:shadow-lg transition-all",
                        savedStatus === 'APPLIED' && "bg-green-600 hover:bg-green-700"
                    )}
                    onClick={() => handleAction('APPLIED')}
                    disabled={isPending || savedStatus !== 'IDLE'}
                >
                    {savedStatus === 'APPLIED' ? (
                        <>
                            <Check className="w-4 h-4" /> Tracked
                        </>
                    ) : (
                        <>
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            {isPending ? "Adding..." : "Track Job"}
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
