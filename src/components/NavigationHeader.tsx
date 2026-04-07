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
        bg-secondary hover:bg-secondary/80 border border-border shadow-sm text-muted-foreground hover:text-foreground"
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
        className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm
        bg-primary group-hover:bg-primary-hover transition-colors duration-200">
        <Briefcase className="w-4 h-4 text-primary-foreground" />
      </div>
      <span className="font-bold text-foreground hidden sm:inline transition-colors duration-300">
        CareerOS
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
        <div className={cn(innerWrap, "py-3 flex items-center justify-between")}>
          <NavLogo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {!session ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="hidden sm:flex px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300
                    text-secondary-foreground bg-secondary hover:bg-secondary/80 border border-border">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="group relative px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-300 shadow-md
                    bg-primary text-primary-foreground hover:shadow-primary/25 overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative flex items-center gap-2">
                    Get Started
                  </span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300
                    text-destructive bg-destructive/10 hover:bg-destructive hover:text-destructive-foreground
                    border border-destructive/20">
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
                <Link
                  href="/dashboard"
                  className="group relative px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-300 shadow-md
                    bg-foreground text-background hover:shadow-black/20 dark:hover:shadow-white/20 overflow-hidden">
                  <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative flex items-center gap-2">
                    Console
                    <Home className="w-3.5 h-3.5" />
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
        <div className={cn(innerWrap, "py-3 flex items-center justify-between")}>
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
              <p className="text-xs text-muted-foreground">Explore opportunities</p>
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
    const mobileNav = [
      { label: "Dashboard",     href: "/dashboard",          exact: true },
      { label: "Discover Jobs", href: "/dashboard/explore"              },
      { label: "Pipeline",      href: "/dashboard/pipeline"             },
      { label: "Applications",  href: "/dashboard/activity"             },
      { label: "Story Bank",    href: "/dashboard/stories"              },
      { label: "My Profile",    href: "/dashboard/profile"              },
      { label: "Settings",      href: "/dashboard/settings"             },
    ];

    return (
      <>
        {/* Mobile-only top bar */}
        <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between h-14 px-4">
            <NavLogo href="/dashboard" />
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Toggle menu">
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {showMobileMenu && (
            <div className="border-t border-border bg-card px-3 py-2 space-y-0.5">
              {mobileNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}>
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
                Sign out
              </button>
            </div>
          )}
        </header>
      </>
    );
  }

  // ── AUTH PAGES ────────────────────────────────
  if (isAuthPage) {
    return (
      <header className={headerBase}>
        <div className={cn(innerWrap, "py-3 flex items-center justify-between")}>
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
