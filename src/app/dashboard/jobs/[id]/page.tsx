import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobById, deleteJob } from "@/app/actions/jobs";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusSelector } from "@/components/StatusSelector";
import { Timeline } from "@/components/Timeline";
import { formatDate, formatSalary } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Pencil,
  Trash2,
  FileText,
  Clock,
} from "lucide-react";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {job.position}
            </h1>
            <div className="flex items-center gap-2 text-gray-400">
              <Building2 className="w-4 h-4" />
              <span className="text-lg">{job.company}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusSelector jobId={job.id} currentStatus={job.status} />
            <Link href={`/dashboard/jobs/${job.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <form action={async () => {
              "use server";
              await deleteJob(id);
            }}>
              <Button variant="destructive" size="sm" type="submit">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </form>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {job.location && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-white">{job.location}</p>
                      </div>
                    </div>
                  )}
                  {(job.salaryMin || job.salaryMax) && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Salary Range</p>
                        <p className="text-white">
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Applied On</p>
                      <p className="text-white">{formatDate(job.appliedAt)}</p>
                    </div>
                  </div>
                  {job.jobUrl && (
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Job Posting</p>
                        <p className="text-indigo-400">View Original Post</p>
                      </div>
                    </a>
                  )}
                </div>

                {job.description && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Job Description
                    </h3>
                    <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-800">
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {job.description}
                      </p>
                    </div>
                  </div>
                )}

                {job.notes && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Personal Notes
                    </h3>
                    <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {job.notes}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Timeline */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline events={job.timeline} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
