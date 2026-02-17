import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobById, deleteJob } from "@/app/actions/jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden pt-24">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-mesh dark:bg-mesh-dark" />
      <div className="absolute inset-0 bg-aurora" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-float-delayed" />
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              <span className="text-gradient">{job.position}</span>
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground group">
              <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <span className="text-lg font-medium">{job.company}</span>
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
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-indigo-500/10">
                  <FileText className="w-5 h-5 text-indigo-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Job Details</h2>
              </div>

              <div className="space-y-4 relative">
                <div className="grid sm:grid-cols-2 gap-4">
                  {job.location && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary/80 transition-colors">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Location</p>
                        <p className="text-foreground font-medium">{job.location}</p>
                      </div>
                    </div>
                  )}
                  {(job.salaryMin || job.salaryMax) && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary/80 transition-colors">
                      <DollarSign className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Salary Range</p>
                        <p className="text-foreground font-medium">
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50 hover:bg-secondary/80 transition-colors">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Applied On</p>
                      <p className="text-foreground font-medium">{formatDate(job.appliedAt)}</p>
                    </div>
                  </div>
                  {job.jobUrl && (
                    <a
                      href={job.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-colors group"
                    >
                      <ExternalLink className="w-5 h-5 text-indigo-500 ml-1 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="text-xs text-indigo-500/70 font-medium">Job Posting</p>
                        <p className="text-indigo-600 font-semibold">View Original Post</p>
                      </div>
                    </a>
                  )}
                </div>

                {job.description && (
                  <div className="mt-8">
                    <h3 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                      Job Description
                    </h3>
                    <div className="p-5 rounded-xl bg-background/40 border border-border/50 backdrop-blur-sm">
                      <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {job.description}
                      </p>
                    </div>
                  </div>
                )}

                {job.notes && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-muted-foreground mb-3">
                      Personal Notes
                    </h3>
                    <div className="p-5 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {job.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Timeline */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-purple-500/10">
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Timeline</h2>
              </div>
              <Timeline events={job.timeline} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
