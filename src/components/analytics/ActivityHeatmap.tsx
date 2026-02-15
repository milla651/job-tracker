"use client";

import { useMemo } from "react";
import { DailyActivity } from "@/app/actions/analytics";
import {
    subDays,
    eachDayOfInterval,
    format,
    isSameDay,
    startOfWeek,
    endOfWeek,
    getDay
} from "date-fns";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActivityHeatmapProps {
    data: DailyActivity[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    const daysToRender = 365;
    const today = new Date();
    const startDate = subDays(today, daysToRender);

    // Create a map for fast lookups
    const dataMap = useMemo(() => {
        const map = new Map<string, number>();
        data.forEach((item) => map.set(item.date, item.count));
        return map;
    }, [data]);

    // Generate all days to render
    const days = useMemo(() => {
        return eachDayOfInterval({ start: startDate, end: today });
    }, [startDate, today]);

    // Determine intensity level (0-4)
    const getIntensity = (count: number) => {
        if (count === 0) return 0;
        if (count === 1) return 1;
        if (count <= 3) return 2;
        if (count <= 5) return 3;
        return 4;
    };

    const getColor = (intensity: number) => {
        switch (intensity) {
            case 0: return "bg-gray-100 dark:bg-gray-800/50";
            case 1: return "bg-primary/30 dark:bg-primary/30";
            case 2: return "bg-primary/50 dark:bg-primary/50";
            case 3: return "bg-primary/70 dark:bg-primary/70";
            case 4: return "bg-primary dark:bg-primary";
            default: return "bg-gray-100 dark:bg-gray-800/50";
        }
    };

    return (
        <div className="w-full overflow-x-auto pb-2">
            <div className="min-w-[700px]">
                <div className="flex gap-1">
                    {/* We render columns of weeks. 
              But standard flex wrap is row-based. 
              So we'll use CSS Grid for a true matrix.
          */}
                    <div
                        className="grid grid-rows-7 grid-flow-col gap-1"
                        style={{
                            gridTemplateColumns: `repeat(${Math.ceil(days.length / 7)}, minmax(0, 1fr))`
                        }}
                    >
                        {days.map((day) => {
                            const dateKey = format(day, "yyyy-MM-dd");
                            const count = dataMap.get(dateKey) || 0;
                            const intensity = getIntensity(count);

                            return (
                                <TooltipProvider key={dateKey}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div
                                                className={cn(
                                                    "w-3 h-3 rounded-[2px] transition-colors hover:ring-2 ring-primary/50 ring-offset-1 dark:ring-offset-black",
                                                    getColor(intensity)
                                                )}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs font-medium">
                                                {count} applications on {format(day, "MMM d, yyyy")}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                        })}
                    </div>
                </div>
                <div className="mt-2 flex items-center justify-end gap-2 text-xs text-muted-foreground">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-[2px] bg-gray-100 dark:bg-gray-800/50" />
                        <div className="w-3 h-3 rounded-[2px] bg-primary/30" />
                        <div className="w-3 h-3 rounded-[2px] bg-primary/50" />
                        <div className="w-3 h-3 rounded-[2px] bg-primary/70" />
                        <div className="w-3 h-3 rounded-[2px] bg-primary" />
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
}
