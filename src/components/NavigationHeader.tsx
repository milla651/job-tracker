"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sun,
  Moon,
  LogOut,
  ArrowLeft,
  Home,
  Menu,
  X,
  Briefcase,
  Rocket,
  LayoutDashboard,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { Session } from "next-auth";
import { logoutUser } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
        bg-secondary/90 dark:bg-secondary/80 border border-border/70 dark:border-border/60 shadow-sm text-secondary-foreground dark:text-secondary-foreground
        hover:bg-secondary dark:hover:bg-secondary/90 hover:text-foreground"
      aria-label="Toggle theme">
      <Sun className="h-4 w-4 absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="h-4 w-4 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
}

function NavLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 group">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm relative overflow-hidden
        bg-gradient-to-br from-indigo-500 to-violet-600 group-hover:shadow-md group-hover:shadow-primary/30 transition-all duration-300">
        <div className="absolute inset-0 bg-white/20 blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white relative z-10">
          <path d="M12 5L4 9l8 4 8-4-8-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 14l8 4 8-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="font-extrabold tracking-tight text-foreground hidden sm:inline transition-colors duration-300 text-lg">
        Career<span className="text-primary">OS</span>
      </span>
    </Link>
  );
}

interface NavigationHeaderProps {
  session: Session | null;
}

export function NavigationHeader({ session }: NavigationHeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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

  const headerBase =
    "fixed top-0 left-0 right-0 z-40 transition-colors duration-300 " +
    "bg-card/85 backdrop-blur-md border-b border-border";

  const innerWrap = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

  // ── LANDING / UNAUTHENTICATED ─────────────────
  if ((isLandingPage || !session) && !isDashboard && !isJobsPage) {
    return (
      <header className={headerBase}>
        <div
          className={cn(innerWrap, "py-3 flex items-center justify-between")}>
          <NavLogo />
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            {!session ? (
              <div className="flex items-center gap-2">
                {/* Sign In Button */}
                <Link
                  href="/login"
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold rounded-lg
                    text-foreground hover:text-foreground
                    bg-transparent hover:bg-secondary/80 dark:hover:bg-secondary/50
                    border border-border/50 hover:border-border
                    transition-all duration-200 ease-out">
                  Sign In
                </Link>
                {/* Get Started CTA */}
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center px-5 py-2 
                    text-sm font-bold rounded-lg overflow-hidden
                    text-white
                    shadow-[0_0_20px_-5px_rgba(var(--primary),0.4)]
                    transition-all duration-300 ease-out
                    hover:shadow-[0_0_25px_-5px_rgba(var(--primary),0.6)]
                    hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 hover:opacity-90 transition-opacity duration-300" style={{ backgroundSize: "200% 100%" }} />
                  <span className="relative flex items-center gap-2">
                    Get Started
                    <Rocket className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 
                    text-sm font-medium rounded-lg
                    text-foreground
                    bg-secondary/80 dark:bg-secondary/90 hover:bg-secondary/95 dark:hover:bg-destructive/20
                    border border-border/60 dark:border-destructive/30
                    shadow-sm dark:shadow-slate-900/15
                    transition-all duration-200 ease-out hover:shadow-md dark:hover:shadow-lg
                    focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-destructive/30 focus:ring-offset-1">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
                {/* Dashboard Button */}
                <Link
                  href="/dashboard"
                  className="group relative inline-flex items-center justify-center px-5 py-2.5 
                    text-sm font-semibold rounded-lg
                    bg-primary hover:bg-primary/95 dark:hover:bg-primary text-primary-foreground
                    border border-primary/60 dark:border-primary/80 hover:border-primary dark:hover:border-primary
                    shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-primary/30
                    transition-all duration-200 ease-out
                    active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 dark:focus:ring-offset-slate-950">
                  <span className="flex items-center gap-2">
                    Dashboard
                    <LayoutDashboard className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  // ── JOBS PAGE ─────────────────────────────────
  if (isJobsPage) {
    return (
      <header className={headerBase}>
        <div
          className={cn(innerWrap, "py-3 flex items-center justify-between")}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg transition-colors duration-200
                text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Go back">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight transition-colors duration-300">
                Find Jobs
              </p>
              <p className="text-xs text-muted-foreground">
                Explore opportunities
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {session && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg transition-colors duration-200
                  text-destructive hover:bg-destructive/10"
                aria-label="Sign out">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // ── DASHBOARD ─────────────────────────────────
  if (isDashboard && session) {
    const navItems = [
      { label: "Overview", href: "/dashboard", exact: true },
      { label: "Pipeline", href: "/dashboard/pipeline" },
      { label: "Explore", href: "/dashboard/explore" },
      { label: "Activity", href: "/dashboard/activity" },
      { label: "Stories", href: "/dashboard/stories" },
    ];

    return (
      <header className={headerBase}>
        <div className={cn(innerWrap, "h-16 flex items-center justify-between")}>
          <div className="flex items-center gap-8">
            <NavLogo href="/dashboard" />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = item.exact 
                  ? pathname === item.href 
                  : pathname?.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 pr-2 border-r border-border">
              <ThemeToggle />
            </div>
            
            {/* User Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/profile"
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  pathname === "/dashboard/profile" 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title="Profile"
              >
                <Rocket className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
              
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-border bg-card px-3 py-4 space-y-1 animate-in fade-in slide-in-from-top-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMobileMenu(false)}
                className={cn(
                  "flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-border flex flex-col gap-1">
              <Link
                href="/dashboard/profile"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Settings & Profile
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>
    );
  }

  // ── AUTH PAGES ────────────────────────────────
  if (isAuthPage) {
    return (
      <header className={headerBase}>
        <div
          className={cn(innerWrap, "py-3 flex items-center justify-between")}>
          <NavLogo />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/"
              className="p-2 rounded-lg transition-colors duration-200
                text-muted-foreground hover:text-foreground hover:bg-muted"
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
