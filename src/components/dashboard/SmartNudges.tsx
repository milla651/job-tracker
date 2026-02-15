"use client";

import { useEffect, useState } from "react";
import { getSmartNudges, Nudge } from "@/app/actions/nudges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
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
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Smart Nudges
                </h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVisible(false)}
                    className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {nudges.map((nudge, index) => (
                        <motion.div
                            key={nudge.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={cn(
                                "border-l-4 shadow-sm hover:shadow-md transition-shadow",
                                nudge.type === "STALE" ? "border-l-amber-500" : "border-l-blue-500"
                            )}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            {nudge.type === "STALE" ? (
                                                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Stale Application
                                                </span>
                                            ) : (
                                                <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                                    <RefreshCw className="w-3 h-3" /> Time to Follow Up
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {nudge.daysSinceUpdate}d ago
                                        </span>
                                    </div>

                                    <h3 className="font-semibold text-foreground truncate" title={nudge.jobTitle}>
                                        {nudge.jobTitle}
                                    </h3>
                                    <p className="text-sm text-muted-foreground truncate mb-4">
                                        {nudge.company}
                                    </p>

                                    <div className="flex justify-end">
                                        <Link href={`/dashboard/jobs/${nudge.id}`}>
                                            <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
                                                View Application <ChevronRight className="w-3 h-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
