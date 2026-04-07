import { getPaginatedJobs } from "@/lib/mock-jobs";
import { PublicJobCard } from "@/components/jobs/PublicJobCard";
import {
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  Telescope,
  Bookmark,
  SendHorizonal,
} from "lucide-react";
import { ExploreFilters } from "./components/ExploreFilters";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";
import Link from "next/link";

export const metadata = {
  title: "Discover Jobs — CareerOS",
  description: "Find your next opportunity and track it instantly.",
};

export default async function ExplorePage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const query    = (searchParams?.query    as string) || "";
  const location = (searchParams?.location as string) || "";
  const time     = (searchParams?.time     as string) || "any";
  const category = (searchParams?.category as string) || "any";
  const source   = (searchParams?.source   as string) || "any";
  const page     = parseInt(searchParams?.page as string) || 1;
  const pageSize = 20;
  const showDiscarded = searchParams?.discarded === "true";

  const { jobs: allJobs, total, totalPages } = await getPaginatedJobs(
    page, pageSize, query, category, time, location, source
  );

  const session = await auth();
  const userJobStatus = new Map<string, "WISHLIST" | "APPLIED" | "DISCARDED">();

  if (session?.user?.id) {
    const userApplications = await prisma.jobApplication.findMany({
      where: { userId: session.user.id },
      select: { company: true, position: true, status: true },
    });
    userApplications.forEach((app) => {
      const key = `${app.company}-${app.position}`;
      let uiStatus: "WISHLIST" | "APPLIED" | "DISCARDED" = "APPLIED";
      if (app.status === JobStatus.WISHLIST)   uiStatus = "WISHLIST";
      if (app.status === JobStatus.DISCARDED)  uiStatus = "DISCARDED";
      userJobStatus.set(key, uiStatus);
    });
  }

  const filteredJobs = allJobs.filter((job) => {
    const status = userJobStatus.get(`${job.company}-${job.title}`);
    return showDiscarded ? status === "DISCARDED" : status !== "DISCARDED";
  });

  const savedCount   = [...userJobStatus.values()].filter((s) => s === "WISHLIST").length;
  const appliedCount = [...userJobStatus.values()].filter((s) => s === "APPLIED").length;

  const hasFilters = query || location || time !== "any" || category !== "any" || source !== "any" || showDiscarded;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          {/* ── Filter sidebar ──────────────────────────────── */}
          <aside className="w-full md:w-64 lg:w-72 shrink-0 space-y-4 md:sticky md:top-8 md:self-start md:max-h-[calc(100vh-4rem)] overflow-y-auto no-scrollbar pb-4">

            {/* Page title */}
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
                <Telescope className="h-4 w-4 text-indigo-500" />
              </div>
              <div>
                <h1 className="text-base font-bold text-stone-900 dark:text-stone-50">Discover</h1>
                <p className="text-xs text-stone-400">{total.toLocaleString()} opportunities</p>
              </div>
            </div>

            {/* Your stats (logged in) */}
            {session && (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 space-y-3">
                <p className="text-xs font-bold text-stone-400 dark:text-stone-600 uppercase tracking-widest">Your activity</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60">
                    <Bookmark className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-stone-800 dark:text-stone-100">{savedCount}</p>
                      <p className="text-[10px] text-stone-400 leading-none">Saved</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60">
                    <SendHorizonal className="h-3.5 w-3.5 text-teal-500 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-stone-800 dark:text-stone-100">{appliedCount}</p>
                      <p className="text-[10px] text-stone-400 leading-none">Applied</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-stone-400 dark:text-stone-600 uppercase tracking-widest">Filters</p>
                {hasFilters && (
                  <Link href="/dashboard/explore" className="text-[10px] font-semibold text-red-500 hover:underline flex items-center gap-1">
                    <X className="h-3 w-3" /> Clear
                  </Link>
                )}
              </div>
              <ExploreFilters />
            </div>
          </aside>

          {/* ── Job grid ────────────────────────────────────── */}
          <main className="flex-1 min-w-0 space-y-5">
            {/* Result header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                {filteredJobs.length > 0
                  ? `${filteredJobs.length} jobs${hasFilters ? " matching filters" : ""}`
                  : "No results"}
              </h2>
              {hasFilters && (
                <Link href="/dashboard/explore" className="text-xs text-stone-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                  <X className="h-3 w-3" /> Clear filters
                </Link>
              )}
            </div>

            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredJobs.map((job) => {
                  const key = `${job.company}-${job.title}`;
                  return (
                    <PublicJobCard
                      key={job.id}
                      job={job}
                      initialStatus={userJobStatus.get(key) || "IDLE"}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
                <div className="h-12 w-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-stone-400" />
                </div>
                <p className="text-base font-semibold text-stone-700 dark:text-stone-200 mb-1">No jobs found</p>
                <p className="text-sm text-stone-400 max-w-xs mx-auto mb-4">
                  {showDiscarded
                    ? "Your discarded list is empty."
                    : "Try adjusting your filters or search query."}
                </p>
                {hasFilters && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/explore">Clear all filters</Link>
                  </Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {filteredJobs.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 py-4">
                <form action="/dashboard/explore" className="contents">
                  {query    && <input type="hidden" name="query"    value={query} />}
                  {location && <input type="hidden" name="location" value={location} />}
                  {time     !== "any" && <input type="hidden" name="time"     value={time} />}
                  {category !== "any" && <input type="hidden" name="category" value={category} />}
                  {source   !== "any" && <input type="hidden" name="source"   value={source} />}
                  {showDiscarded      && <input type="hidden" name="discarded" value="true" />}
                  <input type="hidden" name="page" value={Math.max(1, page - 1)} />
                  <Button type="submit" variant="outline" disabled={page <= 1} className="gap-2">
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                </form>

                <span className="text-sm text-stone-500 px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
                  <span className="font-semibold text-stone-800 dark:text-stone-100">{page}</span>
                  {" "}/{" "}
                  <span className="font-semibold text-stone-800 dark:text-stone-100">{totalPages}</span>
                </span>

                <form action="/dashboard/explore" className="contents">
                  {query    && <input type="hidden" name="query"    value={query} />}
                  {location && <input type="hidden" name="location" value={location} />}
                  {time     !== "any" && <input type="hidden" name="time"     value={time} />}
                  {category !== "any" && <input type="hidden" name="category" value={category} />}
                  {source   !== "any" && <input type="hidden" name="source"   value={source} />}
                  {showDiscarded      && <input type="hidden" name="discarded" value="true" />}
                  <input type="hidden" name="page" value={page + 1} />
                  <Button type="submit" variant="outline" disabled={page >= totalPages} className="gap-2">
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
