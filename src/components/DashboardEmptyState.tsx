"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus, Rocket, Sparkles, Target, Map, ArrowRight } from "lucide-react";

export function DashboardEmptyState() {
    return (
        <div className="relative overflow-hidden rounded-3xl glass-card p-10 md:p-20 text-center border border-primary/20">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float-delayed" />

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `linear-gradient(currentColor 1px, transparent 1px),
                            linear-gradient(90deg, currentColor 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                {/* Animated Icon Container */}
                <div className="relative mb-8 group">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-all duration-500" />
                    <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/25 group-hover:scale-110 transition-transform duration-500">
                        <Rocket className="w-10 h-10 text-white animate-pulse-slow" />
                    </div>

                    {/* Floating Orbiting Icons */}
                    <div className="absolute -top-4 -right-4 bg-background p-2 rounded-xl shadow-lg border border-border/50 animate-bounce delay-100">
                        <Target className="w-5 h-5 text-accent" />
                    </div>
                    <div className="absolute -bottom-2 -left-4 bg-background p-2 rounded-xl shadow-lg border border-border/50 animate-bounce delay-300">
                        <Map className="w-5 h-5 text-primary" />
                    </div>
                </div>

                {/* Headline */}
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    <span className="text-foreground">Ready for </span>
                    <span className="text-gradient">Liftoff?</span>
                </h2>

                <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg">
                    Your mission control is quiet... too quiet.
                    <br className="hidden md:block" />
                    Launch your first application to start tracking your journey to the moon.
                </p>

                {/* CTA Button */}
                <Link href="/dashboard/jobs/new">
                    <Button
                        size="lg"
                        className="group relative overflow-hidden bg-gradient-brand shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 text-lg px-8 py-6 h-auto rounded-2xl"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="relative flex items-center gap-3">
                            <Plus className="w-6 h-6" />
                            <span>Track First Application</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Button>
                </Link>

                {/* Helper Text */}
                <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground font-medium bg-secondary/50 px-4 py-2 rounded-full backdrop-blur-sm border border-border/50">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Pro Tip: Add your "dream company" even if you haven't applied yet!</span>
                </div>
            </div>
        </div>
    );
}
