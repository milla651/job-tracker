// import { Suspense } from "react";
import { getPaginatedJobs } from "@/lib/mock-jobs";
import { PublicJobCard } from "@/components/jobs/PublicJobCard";
import {
  Sparkles,
  Search,
  Briefcase,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";

export const metadata = {
  title: "Explore Jobs | JobTracker",
  description: "Find your next dream job and track it instantly.",
};

export default async function ExplorePage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const query = (searchParams?.query as string) || "";
  const page = parseInt(searchParams?.page as string) || 1;
  const pageSize = 20; // Jobs per page
  const showDiscarded = searchParams?.discarded === "true";

  // Get paginated jobs from the optimized loader
  const {
    jobs: allJobs,
    total,
    totalPages,
  } = await getPaginatedJobs(page, pageSize, query);
  const session = await auth();

  // Create a map of user's existing applications
  const userJobStatus = new Map<string, "WISHLIST" | "APPLIED" | "DISCARDED">();

  if (session?.user?.id) {
    const userApplications = await prisma.jobApplication.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        company: true,
        position: true,
        status: true,
      },
    });

    userApplications.forEach((app) => {
      const key = `${app.company}-${app.position}`;
      let uiStatus: "WISHLIST" | "APPLIED" | "DISCARDED" = "APPLIED";

      if (app.status === JobStatus.WISHLIST) uiStatus = "WISHLIST";
      else if (app.status === JobStatus.DISCARDED) uiStatus = "DISCARDED";

      userJobStatus.set(key, uiStatus);
    });
  }

  // Filter jobs for discarded status on the client (after pagination)
  const filteredJobs = allJobs.filter((job) => {
    const key = `${job.company}-${job.title}`;
    const status = userJobStatus.get(key);
    const isDiscarded = status === "DISCARDED";

    if (showDiscarded) {
      return isDiscarded;
    } else {
      return !isDiscarded;
    }
  });

  // Calculate statistics
  const savedCount = Array.from(userJobStatus.values()).filter(
    (s) => s === "WISHLIST",
  ).length;
  const appliedCount = Array.from(userJobStatus.values()).filter(
    (s) => s === "APPLIED",
  ).length;

  return (
    <div className="min-h-screen pt-24 pb-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-mesh dark:bg-mesh-dark opacity-50" />
      <div className="absolute inset-0 bg-aurora opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              {total} matching opportunities
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Explore <span className="text-gradient">Job Opportunities</span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            Browse hand-picked opportunities from top tech companies. Save them
            to your dashboard and track your progress.
          </p>

          {/* Enhanced Search Bar */}
          <form
            action="/dashboard/explore"
            className="relative max-w-lg mx-auto flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                name="query"
                defaultValue={query}
                placeholder="Search roles, companies, keywords..."
                className="pl-10 h-12 rounded-xl bg-background/50 backdrop-blur border-border/50 focus:bg-background transition-all"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-12 rounded-xl px-6 bg-gradient-brand shadow-lg hover:shadow-primary/25">
              Search
            </Button>
          </form>

          {/* Filter Status Bar */}
          <div className="flex flex-wrap justify-center items-center gap-2 text-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Filters:</span>
            </div>

            <form action="/dashboard/explore" className="inline">
              {query && <input type="hidden" name="query" value={query} />}
              {showDiscarded ? (
                <Button
                  variant="outline"
                  className="rounded-lg gap-2 border-primary/20 bg-primary/5 text-primary h-8 px-3 text-sm">
                  <Briefcase className="w-4 h-4" />
                  Active Jobs
                </Button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-muted/50">
                  All Jobs
                </button>
              )}
            </form>

            <div className="w-px h-5 bg-border/50" />

            <form action="/dashboard/explore" className="inline">
              {query && <input type="hidden" name="query" value={query} />}
              <input type="hidden" name="discarded" value="true" />
              {showDiscarded ? (
                <Button
                  variant="outline"
                  className="rounded-lg gap-1.5 border-destructive/20 bg-destructive/5 text-destructive h-8 px-3 text-sm">
                  <X className="w-4 h-4" />
                  Discarded ({total})
                </Button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-muted/50">
                  Show Discarded
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Quick Stats Bar */}
        {session && (
          <div className="grid grid-cols-3 gap-3 mb-8 md:grid-cols-3">
            <div className="glass-card p-4 rounded-lg text-center border border-border/50">
              <p className="text-2xl font-bold text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Available Jobs
              </p>
            </div>
            <div className="glass-card p-4 rounded-lg text-center border border-border/50">
              <p className="text-2xl font-bold text-foreground">{savedCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Saved</p>
            </div>
            <div className="glass-card p-4 rounded-lg text-center border border-border/50">
              <p className="text-2xl font-bold text-foreground">
                {appliedCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Applied</p>
            </div>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-up fade-in-up-delay-2">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => {
              const key = `${job.company}-${job.title}`;
              const initialStatus = userJobStatus.get(key) || "IDLE";

              return (
                <PublicJobCard
                  key={job.id}
                  job={job}
                  initialStatus={initialStatus}
                />
              );
            })
          ) : (
            <div className="col-span-full text-center py-20">
              <div className="inline-flex p-4 rounded-full bg-muted/50 mb-4">
                <Briefcase className="w-8 h-8" />
              </div>
              <p className="text-lg font-medium text-foreground mb-1">
                No jobs found
              </p>
              <p className="text-sm text-muted-foreground">
                {showDiscarded
                  ? "Your discarded list is empty!"
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredJobs.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12 fade-in-up fade-in-up-delay-3">
            <form action="/dashboard/explore" className="contents">
              {query && <input type="hidden" name="query" value={query} />}
              {showDiscarded && (
                <input type="hidden" name="discarded" value="true" />
              )}
              <input type="hidden" name="page" value={Math.max(1, page - 1)} />
              <Button
                type="submit"
                variant="outline"
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg">
                ← Previous
              </Button>
            </form>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{page}</span>
              <span>/</span>
              <span>{totalPages}</span>
              <span className="text-xs ml-2">({total} total)</span>
            </div>

            <form action="/dashboard/explore" className="contents">
              {query && <input type="hidden" name="query" value={query} />}
              {showDiscarded && (
                <input type="hidden" name="discarded" value="true" />
              )}
              <input type="hidden" name="page" value={page + 1} />
              <Button
                type="submit"
                variant="outline"
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg gap-2">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
