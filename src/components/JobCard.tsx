import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate, formatSalary } from "@/lib/utils";
import { JobApplication } from "@prisma/client";
import { MapPin, Calendar, DollarSign, ExternalLink } from "lucide-react";

interface JobCardProps {
  job: JobApplication;
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/dashboard/jobs/${job.id}`}>
      <div className="glass-card-hover group cursor-pointer p-6 relative overflow-hidden">
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
