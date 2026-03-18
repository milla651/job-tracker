import { getPaginatedJobs } from "@/lib/mock-jobs";
import { PublicJobCard } from "@/components/jobs/PublicJobCard";
import {
  Search,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Filter,
  X,
  MapPin,
} from "lucide-react";
import { ExploreFilters } from "./components/ExploreFilters";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";
import Link from "next/link";

export const metadata = {
  title: "Explore Jobs | JobTracker",
  description: "Find your next dream job and track it instantly.",
};

export default async function ExplorePage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const query = (searchParams?.query as string) || "";
  const location = (searchParams?.location as string) || "";
  const time = (searchParams?.time as string) || "any";
  const category = (searchParams?.category as string) || "any";
  const source = (searchParams?.source as string) || "any";
  const page = parseInt(searchParams?.page as string) || 1;
  const pageSize = 20; // Jobs per page
  const showDiscarded = searchParams?.discarded === "true";

  // Get paginated jobs from the optimized loader
  const {
    jobs: allJobs,
    total,
    totalPages,
  } = await getPaginatedJobs(page, pageSize, query, category, time, location, source);
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
    <div className="min-h-screen pt-24 pb-12 relative overflow-hidden flex flex-col">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-mesh dark:bg-mesh-dark opacity-50 pointer-events-none" />
      <div className="absolute inset-0 bg-aurora opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col md:flex-row gap-8">
        
        {/* Sidebar / Aside Filters & Stats */}
        <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 space-y-6 fade-in-up md:sticky md:top-24 md:self-start md:max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar pb-4">
          {session && (
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card flex flex-col justify-center items-center py-4 rounded-xl border border-border/50 bg-background/50 shadow-sm">
                <p className="text-2xl font-bold tracking-tight text-foreground">{total}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1 text-center">Found Jobs</p>
              </div>
              <div className="glass-card flex flex-col justify-center items-center py-4 rounded-xl border border-border/50 bg-background/50 shadow-sm">
                <p className="text-2xl font-bold tracking-tight text-foreground">{savedCount}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1 text-center">Saved</p>
              </div>
              <div className="glass-card flex flex-col justify-center items-center py-4 rounded-xl border border-border/50 bg-background/50 shadow-sm col-span-2">
                <p className="text-2xl font-bold tracking-tight text-foreground">{appliedCount}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1 text-center">Applied Apps</p>
              </div>
            </div>
          )}

          <ExploreFilters />
        </aside>

        {/* Main Content (Jobs list) */}
        <main className="flex-1 space-y-6 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 fade-in-up">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                Opportunities
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-sm font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                  {total}
                </span>
              </h1>
              <p className="text-muted-foreground text-sm lg:text-base mt-1.5 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Keep track of your job pipeline from anywhere.
              </p>
            </div>
            {(query || location || time !== "any" || category !== "any" || source !== "any" || showDiscarded) ? (
              <Link href="/dashboard/explore" className="text-sm text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 font-medium border border-transparent hover:border-destructive/20" prefetch={false}>
                <X className="w-3.5 h-3.5" /> Clear filters
              </Link>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 fade-in-up fade-in-up-delay-2">
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
              <div className="col-span-full text-center py-24 glass-card rounded-2xl border border-border/50 shadow-sm flex flex-col items-center justify-center">
                <div className="inline-flex p-5 rounded-full bg-muted/50 mb-4 ring-1 ring-border">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-xl font-semibold text-foreground mb-1">
                  No jobs found
                </p>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  {showDiscarded
                    ? "Your discarded list is empty. You haven't hidden any jobs yet."
                    : "Try adjusting your search query, or checking a different category or time posted."}
                </p>
                {(query || location || category !== "any" || time !== "any" || source !== "any" || showDiscarded) ? (
                  <Button variant="outline" className="mt-6 shadow-sm rounded-lg" asChild>
                    <Link href="/dashboard/explore" prefetch={false}>Clear all filters</Link>
                  </Button>
                ) : null}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {filteredJobs.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 py-8 fade-in-up fade-in-up-delay-3">
              <form action="/dashboard/explore" className="contents">
                {query && <input type="hidden" name="query" value={query} />}
                {location && <input type="hidden" name="location" value={location} />}
                {time !== "any" && <input type="hidden" name="time" value={time} />}
                {category !== "any" && <input type="hidden" name="category" value={category} />}
                {source !== "any" && <input type="hidden" name="source" value={source} />}
                {showDiscarded && <input type="hidden" name="discarded" value="true" />}
                <input type="hidden" name="page" value={Math.max(1, page - 1)} />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-xl gap-2 font-medium shadow-sm hover:bg-muted/50">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>
              </form>

              <div className="flex items-center gap-2 text-sm text-muted-foreground px-4 py-2 bg-background/50 backdrop-blur rounded-xl border border-border/50 shadow-sm">
                <span className="font-semibold text-foreground">{page}</span>
                <span>of</span>
                <span className="font-semibold text-foreground">{totalPages}</span>
              </div>

              <form action="/dashboard/explore" className="contents">
                {query && <input type="hidden" name="query" value={query} />}
                {location && <input type="hidden" name="location" value={location} />}
                {time !== "any" && <input type="hidden" name="time" value={time} />}
                {category !== "any" && <input type="hidden" name="category" value={category} />}
                {source !== "any" && <input type="hidden" name="source" value={source} />}
                {showDiscarded && <input type="hidden" name="discarded" value="true" />}
                <input type="hidden" name="page" value={page + 1} />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-xl gap-2 font-medium shadow-sm hover:bg-muted/50">
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
