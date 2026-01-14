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
      <Card hover className="group cursor-pointer">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
                  {job.position}
                </h3>
                <StatusBadge status={job.status} size="sm" />
              </div>
              <p className="text-gray-400 font-medium mb-3">{job.company}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {job.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                )}
                {(job.salaryMin || job.salaryMax) && (
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Applied {formatDate(job.appliedAt)}</span>
                </div>
              </div>
            </div>
            
            {job.jobUrl && (
              <div className="flex-shrink-0">
                <div className="p-2 rounded-lg bg-gray-800/50 text-gray-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
