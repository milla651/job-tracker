import { Suspense } from "react";
import { getMockJobs } from "@/lib/mock-jobs";
import { PublicJobCard } from "@/components/jobs/PublicJobCard";
import { Sparkles, Search, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobStatus } from "@prisma/client";

export const metadata = {
    title: "Explore Jobs | JobTracker",
    description: "Find your next dream job and track it instantly.",
};

export default async function JobsPage() {
    const jobs = await getMockJobs();
    const session = await auth();

    // Create a map of user's existing applications for quick lookup
    const userJobStatus = new Map<string, 'WISHLIST' | 'APPLIED'>();

    if (session?.user?.id) {
        const userApplications = await prisma.jobApplication.findMany({
            where: {
                userId: session.user.id,
            },
            select: {
                company: true,
                position: true,
                status: true,
            }
        });

        userApplications.forEach(app => {
            // Create a unique key based on company and position (mock matching strategy)
            const key = `${app.company}-${app.position}`;

            // Map Prisma status to our simplified UI status
            // If it's WISHLIST, it's 'WISHLIST'. Anything else is considered 'APPLIED' (tracked)
            const uiStatus = app.status === JobStatus.WISHLIST ? 'WISHLIST' : 'APPLIED';
            userJobStatus.set(key, uiStatus);
        });
    }

    return (
        <div className="min-h-screen pt-24 pb-12 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-mesh dark:bg-mesh-dark opacity-50" />
            <div className="absolute inset-0 bg-aurora opacity-30" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center max-w-2xl mx-auto mb-16 fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 border border-primary/20">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Fresh Opportunities Daily</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        Find Your Next <span className="text-gradient">Dream Job</span>
                    </h1>

                    <p className="text-lg text-muted-foreground mb-10">
                        Browse hand-picked opportunities from top tech companies.
                        Save them to your dashboard with a single click.
                    </p>

                    {/* Search Bar Placeholder */}
                    <div className="relative max-w-lg mx-auto flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search for roles, companies, or keywords..."
                                className="pl-10 h-12 rounded-xl bg-background/50 backdrop-blur border-border/50 focus:bg-background transition-all"
                            />
                        </div>
                        <Button size="lg" className="h-12 rounded-xl px-6 bg-gradient-brand shadow-lg hover:shadow-primary/25">
                            Search
                        </Button>
                    </div>
                </div>

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-in-up fade-in-up-delay-2">
                    {jobs.map((job) => {
                        const key = `${job.company}-${job.title}`;
                        const initialStatus = userJobStatus.get(key) || 'IDLE';

                        return (
                            <PublicJobCard
                                key={job.id}
                                job={job}
                                initialStatus={initialStatus}
                            />
                        );
                    })}
                </div>

                {/* Empty State / Loading State could go here */}
                {jobs.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No jobs found at the moment. Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
