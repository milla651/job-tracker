"use client";

import Link from "next/link";
import { JobApplication } from "@prisma/client";
import { differenceInHours, differenceInDays } from "date-fns";
import {
  Clock,
  AlertCircle,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { AiScoreBadge } from "@/components/ai/AiScoreBadge";
import { formatDate, formatSalary } from "@/lib/utils";

interface JobCardProps {
  job: JobApplication;
}

export function JobCard({ job }: JobCardProps) {
  // Stale check: > 14 days and not closed
  const isStale = differenceInDays(new Date(), new Date(job.updatedAt)) > 14 &&
    !["REJECTED", "WITHDRAWN", "ACCEPTED", "OFFER"].includes(job.status);

  // Follow-up check: Interviewed > 24 hours ago and status is still INTERVIEW
  const needsFollowUp = job.status === "INTERVIEW" &&
    differenceInHours(new Date(), new Date(job.updatedAt)) > 24;

  return (
    <Link href={`/dashboard/jobs/${job.id}`}>
      <div className="group relative glass-card p-5 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 block h-full">
        {/* Indicators Container */}
        <div className="absolute -top-2 -right-2 z-10 flex gap-1">
          {isStale && (
            <div className="bg-amber-500 text-white p-1.5 rounded-full shadow-lg animate-pulse" title="No activity in 14 days">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}
          {needsFollowUp && (
            <div className="bg-blue-500 text-white p-1.5 rounded-full shadow-lg animate-bounce" title="Time to send a thank you note?">
              <Mail className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Hover Highlight Effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {job.position}
                </h3>
                <StatusBadge status={job.status} size="sm" />
                <AiScoreBadge score={job.aiScore} size="sm" />
              </div>
              <p className="text-muted-foreground font-medium mb-3">{job.company}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground/80">
                {job.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary/70" />
                    <span>{job.location}</span>
                  </div>
                )}
                {(job.salaryMin || job.salaryMax) && (
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-primary/70" />
                    <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary/70" />
                  <span>Applied {formatDate(job.appliedAt)}</span>
                </div>
              </div>
            </div>

            {job.jobUrl && (
              <div className="flex-shrink-0 z-10">
                <div className="p-2 rounded-lg bg-secondary/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
