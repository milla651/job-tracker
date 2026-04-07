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

// ── Sub-components declared outside to avoid ESLint react-hooks/static-components

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-200
        text-stone-500 dark:text-stone-400
        hover:text-stone-900 dark:hover:text-stone-100
        hover:bg-stone-100 dark:hover:bg-stone-800"
      aria-label="Toggle theme">
      {/*
        Both icons always in the DOM. CSS transforms control visibility.
        Avoids SSR/client mismatch: `theme` is undefined server-side with
        next-themes, so conditional rendering causes hydration errors.
      */}
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
        bg-teal-600 dark:bg-teal-500
        group-hover:bg-teal-700 dark:group-hover:bg-teal-400
        transition-colors duration-200">
        <Briefcase className="w-4 h-4 text-white dark:text-stone-950" />
      </div>
      <span className="font-bold text-stone-900 dark:text-stone-100 hidden sm:inline transition-colors duration-300">
        JobTracker
      </span>
    </Link>
  );
}

// ────────────────────────────────────────────────

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
    "bg-white/85 dark:bg-stone-900/85 backdrop-blur-md " +
    "border-b border-stone-200 dark:border-stone-800";

  const innerWrap = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

  // ── LANDING / UNAUTHENTICATED ─────────────────
  if ((isLandingPage || !session) && !isDashboard && !isJobsPage) {
    return (
      <header className={headerBase}>
        <div
          className={cn(innerWrap, "py-3 flex items-center justify-between")}>
          <NavLogo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {!session && (
              <>
                <Link
                  href="/login"
                  className="hidden sm:flex px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    text-stone-600 dark:text-stone-300
                    hover:text-stone-900 dark:hover:text-stone-100
                    hover:bg-stone-100 dark:hover:bg-stone-800">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 shadow-md
                    bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20
                    dark:bg-teal-500 dark:text-stone-950 dark:hover:bg-teal-400 dark:shadow-teal-500/15">
                  Get Started
                </Link>
              </>
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
                text-stone-500 dark:text-stone-400
                hover:text-stone-900 dark:hover:text-stone-100
                hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label="Go back">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 leading-tight transition-colors duration-300">
                Find Jobs
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-500">
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
                  text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
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
      { label: "Dashboard",    href: "/dashboard",          exact: true },
      { label: "Discover Jobs",href: "/dashboard/explore"              },
      { label: "Pipeline",     href: "/dashboard/pipeline"             },
      { label: "Applications", href: "/dashboard/activity"             },
      { label: "Story Bank",   href: "/dashboard/stories"              },
      { label: "My Profile",   href: "/dashboard/profile"              },
      { label: "Settings",     href: "/dashboard/settings"             },
    ];

    return (
      <>
        {/* Mobile-only top bar — desktop has the sidebar */}
        <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center justify-between h-14 px-4">
            <NavLogo href="/dashboard" />
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile dropdown */}
          {showMobileMenu && (
            <div className="border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-950 px-3 py-2 space-y-0.5">
              {mobileNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-900"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
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
        <div
          className={cn(innerWrap, "py-3 flex items-center justify-between")}>
          <NavLogo />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/"
              className="p-2 rounded-lg transition-colors duration-200
                text-stone-500 dark:text-stone-400
                hover:text-stone-900 dark:hover:text-stone-100
                hover:bg-stone-100 dark:hover:bg-stone-800"
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
