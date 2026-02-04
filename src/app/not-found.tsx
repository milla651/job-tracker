import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Briefcase, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Animated Mesh Background */}
            <div className="absolute inset-0 bg-mesh dark:bg-mesh-dark" />
            <div className="absolute inset-0 bg-aurora" />

            {/* Floating Orbs */}
            <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-float-delayed" />

            {/* Grid Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Content */}
            <div className="relative text-center max-w-2xl mx-auto">
                {/* 404 Badge */}
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-card mb-8">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                        <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                        Error 404
                    </span>
                </div>

                {/* Main Message */}
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold mb-6">
                    <span className="text-gradient">Oops!</span>
                </h1>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                    Page Not Found
                </h2>

                <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
                    This page seems to have disappeared like that job application you forgot to follow up on.
                    Let&apos;s get you back on track!
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Go Home
                        </Button>
                    </Link>

                    <Button
                        variant="outline"
                        size="lg"
                        className="border-2 border-border hover:border-primary/50 gap-2"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </Button>
                </div>

                {/* Helpful Links */}
                <div className="mt-16 pt-8 border-t border-border/50">
                    <p className="text-sm text-muted-foreground mb-4">You might be looking for:</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link href="/login" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                            Sign In
                        </Link>
                        <span className="text-muted-foreground">•</span>
                        <Link href="/register" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                            Create Account
                        </Link>
                        <span className="text-muted-foreground">•</span>
                        <Link href="/dashboard" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
