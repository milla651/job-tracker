"use client";

import { useEffect, useState } from "react";
import { getSmartNudges, Nudge } from "@/app/actions/nudges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Clock, RefreshCw, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function SmartNudges() {
    const [nudges, setNudges] = useState<Nudge[]>([]);
    const [visible, setVisible] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNudges = async () => {
            try {
                const data = await getSmartNudges();
                setNudges(data);
            } catch (error) {
                console.error("Failed to fetch nudges:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNudges();
    }, []);

    if (loading || !visible || nudges.length === 0) return null;

    return (
        <div className="mb-0">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 text-muted-foreground">
                    <Bell className="w-3.5 h-3.5 text-primary" />
                    Action Needed
                </h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVisible(false)}
                    className="text-muted-foreground hover:text-foreground h-6 w-6 p-0 rounded-full"
                >
                    <X className="w-3.5 h-3.5" />
                </Button>
            </div>

            <div className="space-y-2.5">
                <AnimatePresence>
                    {nudges.map((nudge, index) => (
                        <motion.div
                            key={nudge.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link href={`/dashboard/jobs/${nudge.id}`} className="block group">
                                <div className="relative p-3 rounded-xl border border-border/40 bg-background/40 hover:bg-accent/10 backdrop-blur-sm transition-all duration-300">
                                    {/* Left Accent Bar */}
                                    <div className={cn(
                                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-md transition-all duration-300 opacity-50 group-hover:opacity-100",
                                        nudge.type === "STALE" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                    )} />

                                    <div className="pl-3 flex flex-col gap-1.5">
                                        {/* Header Row */}
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors" title={nudge.jobTitle}>
                                                {nudge.jobTitle}
                                            </h3>
                                             <span className="text-[10px] text-muted-foreground whitespace-nowrap pt-0.5 shrink-0">
                                                {nudge.daysSinceUpdate}d ago
                                            </span>
                                        </div>

                                        {/* Company & Action */}
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-muted-foreground truncate max-w-[140px]">
                                                {nudge.company}
                                            </p>

                                            <div className="flex items-center gap-1">
                                                {nudge.type === "STALE" ? (
                                                    <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                                                        <Clock className="w-2.5 h-2.5" /> Stale
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 bg-blue-500/10 px-1.5 py-0.5 rounded-full">
                                                        <RefreshCw className="w-2.5 h-2.5" /> Follow Up
                                                    </span>
                                                )}
                                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
