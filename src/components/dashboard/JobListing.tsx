"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { JobApplication, JobStatus } from "@prisma/client";
import { JobCard } from "@/components/JobCard";
import { DashboardEmptyState } from "@/components/DashboardEmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    LayoutGrid,
    List as ListIcon,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    X,
    ArrowUpDown,
    Check,
} from "lucide-react";
import { STATUS_CONFIG } from "@/lib/utils";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

// Simple debounce hook if not exists
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

interface JobListingProps {
    initialJobs: JobApplication[];
    total: number;
    totalPages: number;
    currentPage: number;
}

export function JobListing({
    initialJobs,
    total,
    totalPages,
    currentPage,
}: JobListingProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Local state for immediate UI feedback
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchValue, setSearchValue] = useState(
        searchParams.get("search") || ""
    );
    const [statusFilter, setStatusFilter] = useState<JobStatus | "ALL">(
        (searchParams.get("status") as JobStatus) || "ALL"
    );
    const [sortOrder, setSortOrder] = useState(searchParams.get("sort") || "date-desc");
    const [locationFilter, setLocationFilter] = useState(searchParams.get("location") || "");
    const [minSalaryFilter, setMinSalaryFilter] = useState(searchParams.get("minSalary") || "");
    const [maxSalaryFilter, setMaxSalaryFilter] = useState(searchParams.get("maxSalary") || "");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);

    const debouncedSearch = useDebounceValue(searchValue, 500);
    const debouncedLocation = useDebounceValue(locationFilter, 500);
    const debouncedMinSalary = useDebounceValue(minSalaryFilter, 500);
    const debouncedMaxSalary = useDebounceValue(maxSalaryFilter, 500);

    // Sync with URL when filters change
    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        if (debouncedSearch) {
            params.set("search", debouncedSearch);
        } else {
            params.delete("search");
        }

        if (debouncedLocation) {
            params.set("location", debouncedLocation);
        } else {
            params.delete("location");
        }

        if (debouncedMinSalary) {
            params.set("minSalary", debouncedMinSalary);
        } else {
            params.delete("minSalary");
        }

        if (debouncedMaxSalary) {
            params.set("maxSalary", debouncedMaxSalary);
        } else {
            params.delete("maxSalary");
        }

        if (statusFilter !== "ALL") {
            params.set("status", statusFilter);
        } else {
            params.delete("status");
        }

        if (sortOrder !== "date-desc") {
            params.set("sort", sortOrder);
        } else {
            params.delete("sort");
        }

        // Reset pagination on filter change
        if (
            searchParams.get("sort") !== sortOrder ||
            searchParams.get("status") !== statusFilter ||
            searchParams.get("search") !== debouncedSearch ||
            searchParams.get("location") !== debouncedLocation ||
            searchParams.get("minSalary") !== debouncedMinSalary ||
            searchParams.get("maxSalary") !== debouncedMaxSalary
        ) {
            params.set("page", "1");
        }

        startTransition(() => {
            router.push(`?${params.toString()}`, { scroll: false });
        });
    }, [debouncedSearch, statusFilter, sortOrder, debouncedLocation, debouncedMinSalary, debouncedMaxSalary, router]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle pagination
    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());
        startTransition(() => {
            router.push(`?${params.toString()}`, { scroll: false });
        });
    };

    const clearFilters = () => {
        setSearchValue("");
        setLocationFilter("");
        setMinSalaryFilter("");
        setMaxSalaryFilter("");
        setStatusFilter("ALL");
        setSortOrder("date-desc");
    };

    const sortOptions = [
        { value: "date-desc", label: "Newest First" },
        { value: "date-asc", label: "Oldest First" },
        { value: "company-asc", label: "Company (A-Z)" },
        { value: "company-desc", label: "Company (Z-A)" },
        { value: "salary-desc", label: "Highest Salary" },
        { value: "salary-asc", label: "Lowest Salary" },
        { value: "location-asc", label: "Location (A-Z)" },
        { value: "location-desc", label: "Location (Z-A)" },
    ];

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/50">
                {/* Search */}
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search companies or positions..."
                        className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-all"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    {searchValue && (
                        <button
                            onClick={() => setSearchValue("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    {/* Sort Toggle */}
                    <Popover open={isSortOpen} onOpenChange={setIsSortOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={`gap-2 border-border/50 ${sortOrder !== "date-desc" ? "bg-primary/10 border-primary/20 text-primary" : "bg-background/50"
                                    }`}
                            >
                                <ArrowUpDown className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    {sortOptions.find((o) => o.value === sortOrder)?.label}
                                </span>
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-48 p-1">
                            <div className="grid grid-cols-1 gap-0.5">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSortOrder(option.value);
                                            setIsSortOpen(false);
                                        }}
                                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${sortOrder === option.value
                                            ? "bg-primary/10 text-primary font-medium"
                                            : "hover:bg-muted"
                                            }`}
                                    >
                                        {option.label}
                                        {sortOrder === option.value && <Check className="w-3 h-3" />}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Status Filter Toggle */}
                    <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={`gap-2 border-border/50 ${statusFilter !== "ALL" ? "bg-primary/10 border-primary/20 text-primary" : "bg-background/50"
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                <span>
                                    {statusFilter === "ALL"
                                        ? "Status"
                                        : STATUS_CONFIG[statusFilter].label}
                                </span>
                                <ChevronDown className="w-3 h-3 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-72 p-4 flex flex-col gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-foreground">Location</h4>
                                <Input
                                    placeholder="Filter by location..."
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                    className="h-8 bg-background/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-foreground">Salary Range</h4>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Min"
                                        type="number"
                                        value={minSalaryFilter}
                                        onChange={(e) => setMinSalaryFilter(e.target.value)}
                                        className="h-8 bg-background/50"
                                    />
                                    <Input
                                        placeholder="Max"
                                        type="number"
                                        value={maxSalaryFilter}
                                        onChange={(e) => setMaxSalaryFilter(e.target.value)}
                                        className="h-8 bg-background/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-foreground">Status</h4>
                                <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                    <button
                                        onClick={() => {
                                            setStatusFilter("ALL");
                                        }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${statusFilter === "ALL"
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-muted"
                                            }`}
                                    >
                                        <LayoutGrid className="w-4 h-4 opacity-70" />
                                        All Statuses
                                        {statusFilter === "ALL" && <Check className="w-3 h-3 ml-auto" />}
                                    </button>
                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setStatusFilter(key as JobStatus);
                                            }}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${statusFilter === key
                                                ? "bg-primary/10 text-primary"
                                                : "hover:bg-muted"
                                                }`}
                                        >
                                            <span className="text-base">{config.icon}</span>
                                            {config.label}
                                            {statusFilter === key && <Check className="w-3 h-3 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="h-8 w-px bg-border/50 mx-2 hidden md:block" />

                    {/* View Toggle */}
                    <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-md transition-all ${viewMode === "grid"
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-md transition-all ${viewMode === "list"
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Results Count & Active Filters */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
                <span>
                    Showing <strong>{initialJobs.length}</strong> of <strong>{total}</strong> jobs
                </span>
                {(statusFilter !== "ALL" || searchValue) && (
                    <button
                        onClick={clearFilters}
                        className="text-primary hover:underline ml-2 text-xs"
                    >
                        Clear filters
                    </button>
                )}
                {isPending && <span className="animate-pulse ml-auto text-xs">Updating...</span>}
            </div>

            {/* Grid / List View */}
            {initialJobs.length === 0 ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <DashboardEmptyState />
                </div>
            ) : (
                <div
                    className={
                        viewMode === "grid"
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                            : "flex flex-col gap-3"
                    }
                >
                    {initialJobs.map((job) =>
                        viewMode === "grid" ? (
                            <JobCard key={job.id} job={job} />
                        ) : (
                            <Link key={job.id} href={`/dashboard/jobs/${job.id}`}>
                                <div
                                    className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl glass-card hover:bg-accent/5 transition-all border border-border/50 hover:border-primary/20 items-center"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{job.position}</h3>
                                            <StatusBadge status={job.status} size="sm" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">{job.company}</p>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-muted-foreground whitespace-nowrap">
                                        {job.location && <span className="hidden sm:inline-block">{job.location}</span>}
                                        <span className="hidden sm:inline-block">Applied {formatDate(job.appliedAt)}</span>
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        )
                    )}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 pt-4 border-t border-border/50">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1 || isPending}
                        className="w-9 h-9 p-0"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-1 text-sm">
                        <span className="text-muted-foreground">Page</span>
                        <span className="font-medium text-foreground">{currentPage}</span>
                        <span className="text-muted-foreground">of {totalPages}</span>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages || isPending}
                        className="w-9 h-9 p-0"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}