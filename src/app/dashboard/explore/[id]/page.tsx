import { getJobById } from "@/lib/jobs-loader";
import { notFound } from "next/navigation";
import { Building2, MapPin, Timer, Coins, ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";
import { JobActionButtons } from "./components/JobActionButtons";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJobById(id);
  
  if (!job) return { title: "Job Not Found" };
  
  return {
    title: `${job.title} at ${job.company} | JobTracker`,
    description: job.description || `Apply for ${job.title} at ${job.company}`,
  };
}

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  const session = await auth();
  let initialStatus: "IDLE" | "WISHLIST" | "APPLIED" | "DISCARDED" = "IDLE";

  if (session?.user?.id) {
    const existingApp = await prisma.jobApplication.findFirst({
      where: {
        userId: session.user.id,
        company: job.company,
        position: job.title,
      },
    });

    if (existingApp) {
      if (existingApp.status === JobStatus.WISHLIST) initialStatus = "WISHLIST";
      else if (existingApp.status === JobStatus.DISCARDED) initialStatus = "DISCARDED";
      else initialStatus = "APPLIED";
    }
  }

  return (
    <div className="min-h-screen pt-8 pb-12 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-mesh dark:bg-mesh-dark opacity-30 pointer-events-none" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Back navigation */}
        <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground" asChild>
          <Link href="/dashboard/explore" prefetch={false}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Link>
        </Button>

        <div className="glass-card rounded-2xl p-6 md:p-10 border border-border/50 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="space-y-4 max-w-2xl">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3 leading-tight break-words text-wrap">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-muted-foreground text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary/80 shrink-0" />
                    <span className="text-foreground">{job.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary/80 shrink-0" />
                    <span>{job.location || "Remote"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                  <Timer className="w-4 h-4" /> {job.type}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-sm font-medium border border-accent/20">
                  <Coins className="w-4 h-4" /> {job.salary}
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-muted text-foreground text-sm font-medium border border-border">
                  Posted: {new Date(job.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto flex flex-col gap-3">
               <JobActionButtons job={job} initialStatus={initialStatus} />
               <Button variant="outline" className="w-full gap-2 font-medium" asChild>
                 <a href={job.url} target="_blank" rel="noopener noreferrer">
                   View Original Post <ExternalLink className="w-4 h-4 text-muted-foreground" />
                 </a>
               </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="glass-card p-6 md:p-8 rounded-2xl border border-border/50 space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">About the Role</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-4">
                {job.description ? (
                  <p className="whitespace-pre-line">{job.description}</p>
                ) : (
                  <p className="italic text-muted-foreground/70">No specific description provided by the poster.</p>
                )}
              </div>
            </div>

            {(job.requirements?.length ?? 0) > 0 && (
              <div className="glass-card p-6 md:p-8 rounded-2xl border border-border/50 space-y-4">
                <h2 className="text-xl font-bold text-foreground">Requirements</h2>
                <ul className="space-y-2 text-muted-foreground list-disc pl-5">
                  {job.requirements!.map((req, i) => (
                    <li key={i} className="pl-1">{req}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {(job.responsibilities?.length ?? 0) > 0 && (
              <div className="glass-card p-6 md:p-8 rounded-2xl border border-border/50 space-y-4">
                <h2 className="text-xl font-bold text-foreground">Responsibilities</h2>
                <ul className="space-y-2 text-muted-foreground list-disc pl-5">
                  {job.responsibilities!.map((resp, i) => (
                    <li key={i} className="pl-1">{resp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-border/50">
              <h3 className="font-semibold text-foreground mb-4">Job Details</h3>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-muted-foreground mb-1">Source</dt>
                  <dd className="font-medium text-foreground">{job.source || "Direct"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground mb-1">Company</dt>
                  <dd className="font-medium text-foreground">{job.company}</dd>
                </div>
                {job.tags && job.tags.length > 0 && (
                  <div>
                    <dt className="text-muted-foreground mb-2">Categories / Tags</dt>
                    <dd className="flex flex-wrap gap-2">
                      {job.tags.map((tag, i) => (
                        <span key={i} className="bg-muted px-2 py-1 rounded-md text-xs font-medium text-muted-foreground border border-border/50">
                          {tag}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            
            <div className="glass-card p-6 rounded-2xl border bg-gradient-brand/5 border-primary/10">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4" /> Ready to apply?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Track this application to seamlessly manage your interview phases directly inside JobTracker.
              </p>
              <JobActionButtons job={job} initialStatus={initialStatus} compact />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
