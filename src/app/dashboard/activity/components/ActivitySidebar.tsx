import { JobStatus } from "@/lib/db-types";
import { STATUS_CONFIG } from "@/lib/utils";
import { Briefcase, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { SmartNudges } from "@/components/dashboard/SmartNudges";

interface ActivitySidebarProps {
  total: number;
  statsData: {
    total: number;
    stats: { status: JobStatus; _count: { status: number } }[];
  } | null;
}

export function ActivitySidebar({ total, statsData }: ActivitySidebarProps) {
  const totalApplications = statsData?.total || 0;

  const statusCounts =
    statsData?.stats.reduce(
      (acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

  const activeCount =
    totalApplications -
    (statusCounts.ACCEPTED || 0) -
    (statusCounts.REJECTED || 0) -
    (statusCounts.WITHDRAWN || 0);

  const successRate =
    totalApplications > 0
      ? Math.round(((statusCounts["ACCEPTED"] || 0) / totalApplications) * 100)
      : 0;

  const interviewCount =
    (statusCounts["INTERVIEW"] || 0) +
    (statusCounts["TECHNICAL"] || 0) +
    (statusCounts["OFFER"] || 0) +
    (statusCounts["ACCEPTED"] || 0);

  const interviewRate =
    totalApplications > 0
      ? Math.round((interviewCount / totalApplications) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="glass-card p-5 rounded-xl border border-border/50 bg-background/50 backdrop-blur-md shadow-sm">
        <h3 className="font-semibold flex items-center gap-2 mb-4 text-foreground">
          <TrendingUp className="w-4 h-4 text-primary" />
          Overview
        </h3>
        
        {/* Core Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                 {totalApplications}
                 <Briefcase className="w-4 h-4 text-primary/50" />
              </p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Success</p>
              <p className="text-2xl font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                 {successRate}%
                 <CheckCircle2 className="w-4 h-4 opacity-50" />
              </p>
            </div>
            <div className="bg-orange-500/5 border border-orange-500/10 rounded-lg p-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Interviews</p>
              <p className="text-2xl font-bold flex items-center gap-2 text-orange-600 dark:text-orange-400">
                 {interviewRate}%
              </p>
            </div>
            <div className="bg-teal-500/5 border border-teal-500/10 rounded-lg p-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Active</p>
              <p className="text-2xl font-bold flex items-center gap-2 text-teal-600 dark:text-teal-400">
                 {activeCount}
                 <Clock className="w-4 h-4 opacity-50" />
              </p>
            </div>
        </div>

        {/* Status Mini-Bars */}
        <div className="space-y-1.5 mt-2">
           <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Stage Breakdown</p>
           {statsData && statsData.stats.map((stat) => {
               const config = STATUS_CONFIG[stat.status];
               if (stat._count.status === 0) return null;
               
               return (
                 <div key={stat.status} className="flex items-center justify-between text-sm py-1">
                   <div className="flex items-center gap-2">
                     <span className="text-lg">{config.icon}</span>
                     <span className="text-muted-foreground">{config.label}</span>
                   </div>
                   <span className="font-semibold text-foreground">{stat._count.status}</span>
                 </div>
               );
           })}
        </div>
      </div>

      <SmartNudges />
      
    </div>
  );
}
