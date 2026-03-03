"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Menu, X, Sun, Moon, LogOut, ArrowLeft, Home } from "lucide-react";
import { useTheme } from "next-themes";
import type { Session } from "next-auth";
import { logoutUser } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

interface NavigationHeaderProps {
  session: Session | null;
}

/**
 * Context-aware navigation header that changes based on:
 * 1. User authentication state
 * 2. Current page/section
 * 3. User journey stage
 */
export function NavigationHeader({ session }: NavigationHeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // Determine if user is on dashboard or app area
  const isDashboard = pathname?.startsWith("/dashboard");
  const isJobsPage = pathname === "/jobs";
  const isAuthPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/new-verification",
  ].includes(pathname || "");
  const isLandingPage = pathname === "/" || pathname === "";

  const handleLogout = async () => {
    await logoutUser();
    router.push("/");
  };

  // ============================================
  // LANDING PAGE - Unauthenticated
  // ============================================
  if ((isLandingPage || !session) && !isDashboard && !isJobsPage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white text-sm font-bold">JT</span>
            </div>
            <span className="hidden sm:inline">JobTracker</span>
          </Link>

          {/* Theme Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Toggle theme">
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* CTA Buttons */}
            {!session ? (
              <>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "hidden sm:flex text-sm",
                  )}>
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-gradient-brand text-white text-sm",
                  )}>
                  Get Started
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </header>
    );
  }

  // ============================================
  // JOBS EXPLORATION PAGE
  // ============================================
  if (isJobsPage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Left: Back + Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Go back">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex flex-col">
              <h1 className="font-semibold text-foreground">Find Jobs</h1>
              <p className="text-xs text-muted-foreground">
                Explore & save opportunities
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Toggle theme">
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            {session && (
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors text-sm"
                aria-label="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // ============================================
  // DASHBOARD - Authenticated
  // ============================================
  if (isDashboard && session) {
    return (
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo/Branding */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-bold">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white text-sm font-bold">JT</span>
              </div>
              <span className="hidden sm:inline text-sm">JobTracker</span>
            </Link>

            {/* Center: Navigation Dots (Page Indicator) */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  pathname === "/dashboard"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}>
                Pipeline
              </Link>
              <Link
                href="/dashboard/tracker"
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  pathname === "/dashboard/tracker"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}>
                Activity
              </Link>
              <Link
                href="/dashboard/settings"
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  pathname === "/dashboard/settings"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}>
                Settings
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/jobs"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "text-xs",
                )}>
                Explore Jobs
              </Link>

              {/* Mobile Menu */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Toggle menu">
                {showMobileMenu ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Toggle theme">
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              {/* User Menu - Dropdown */}
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                aria-label="Logout"
                title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden pb-3 border-t border-border/50 space-y-1">
              <Link
                href="/dashboard"
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  pathname === "/dashboard"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}>
                Pipeline
              </Link>
              <Link
                href="/dashboard/tracker"
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  pathname === "/dashboard/tracker"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}>
                Activity
              </Link>
              <Link
                href="/dashboard/settings"
                className={cn(
                  "block px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  pathname === "/dashboard/settings"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}>
                Settings
              </Link>
            </div>
          )}
        </div>
      </header>
    );
  }

  // ============================================
  // AUTH PAGES - Minimal Header
  // ============================================
  if (isAuthPage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white text-sm font-bold">JT</span>
            </div>
            <span className="hidden sm:inline">JobTracker</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Toggle theme">
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <Link
              href="/"
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Back to home">
              <Home className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return null;
}
