"use client";

import { Search, MapPin, Filter, Loader2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function ExploreFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const query = searchParams.get("query") || "";
  const location = searchParams.get("location") || "";
  const time = searchParams.get("time") || "any";
  const category = searchParams.get("category") || "any";
  const source = searchParams.get("source") || "any";
  const showDiscarded = searchParams.get("discarded") === "true";

  const handleApply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newParams = new URLSearchParams();

    const newQuery = formData.get("query") as string;
    const newLocation = formData.get("location") as string;
    const newTime = formData.get("time") as string;
    const newCategory = formData.get("category") as string;
    const newSource = formData.get("source") as string;
    const newDiscarded = formData.get("discarded") === "true";

    if (newQuery) newParams.set("query", newQuery);
    if (newLocation) newParams.set("location", newLocation);
    if (newTime && newTime !== "any") newParams.set("time", newTime);
    if (newCategory && newCategory !== "any") newParams.set("category", newCategory);
    if (newSource && newSource !== "any") newParams.set("source", newSource);
    if (newDiscarded) newParams.set("discarded", "true");

    // Preserve the page parameter if it exists, or let it reset to 1 implicitly
    
    startTransition(() => {
      router.push(`/dashboard/explore?${newParams.toString()}`);
    });
  };

  const handleReset = () => {
    startTransition(() => {
      router.push("/dashboard/explore");
    });
  };

  return (
    <div className="glass-card p-5 rounded-xl border border-border/50 bg-background/50 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold flex items-center gap-2 text-foreground">
          <Filter className="w-4 h-4 text-primary" />
          Advanced Search
        </h3>
        {(query || location || time !== "any" || category !== "any" || source !== "any" || showDiscarded) && (
          <button 
            type="button" 
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>
      
      <form onSubmit={handleApply} className="space-y-4 text-sm relative group">
        <fieldset disabled={isPending} className="space-y-4 group-disabled:opacity-70 transition-opacity">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                name="query"
                defaultValue={query}
                placeholder="Search titles/companies"
                className="pl-9 h-10 rounded-lg bg-background border-border/50 focus:bg-background text-sm transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                name="location"
                defaultValue={location}
                placeholder="Nairobi, Remote, etc."
                className="pl-9 h-10 rounded-lg bg-background border-border/50 focus:bg-background text-sm transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Time Posted</label>
            <select name="time" defaultValue={time} className="w-full h-10 px-3 rounded-lg bg-background border border-border/50 focus:border-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm appearance-none cursor-pointer">
              <option value="any">Any Time</option>
              <option value="today">Past 24 Hours</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Category</label>
            <select name="category" defaultValue={category} className="w-full h-10 px-3 rounded-lg bg-background border border-border/50 focus:border-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm appearance-none cursor-pointer">
              <option value="any">All Categories</option>
              <option value="Full Time">Full Time</option>
              <option value="Internship & Graduate">Internship & Graduate</option>
              <option value="Sales">Sales</option>
              <option value="Engineering & Technology">Engineering & Tech</option>
              <option value="Marketing & Communications">Marketing</option>
              <option value="Customer Service & Support">Customer Service</option>
              <option value="Research, Teaching & Training">Education</option>
              <option value="Accounting, Auditing & Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Real Estate">Real Estate</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Source</label>
            <select name="source" defaultValue={source} className="w-full h-10 px-3 rounded-lg bg-background border border-border/50 focus:border-primary text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-sm appearance-none cursor-pointer">
              <option value="any">Any Source</option>
              <option value="BrighterMonday">BrighterMonday</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Indeed">Indeed</option>
              <option value="Direct">Direct / Company</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2 pb-2">
            <input type="checkbox" id="discarded-jobs" name="discarded" value="true" defaultChecked={showDiscarded} className="w-4 h-4 rounded border-border/50 text-primary focus:ring-primary cursor-pointer accent-primary" />
            <label htmlFor="discarded-jobs" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground cursor-pointer select-none">
              Show discarded jobs
            </label>
          </div>

          <Button type="submit" disabled={isPending} className="w-full bg-gradient-brand shadow-md hover:shadow-primary/25 font-semibold mt-2 rounded-lg relative overflow-hidden">
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Refining...
              </span>
            ) : (
              "Apply Filters"
            )}
          </Button>
        </fieldset>
      </form>
    </div>
  );
}
