"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Plus, Briefcase, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import type { Session } from "next-auth";
import { UserMenu } from "@/components/UserMenu";
import { logoutUser } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

interface NavbarProps {
  session: Session | null;
}

export function Navbar({ session }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const publicNav = [
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Jobs", href: "/jobs" },
  ];

  const appNav = [
    { label: "Tracker", href: "/dashboard/tracker" },
    { label: "Jobs", href: "/jobs" },
    { label: "Profile", href: "/dashboard/profile" },
    { label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div
        className={cn(
          "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300",
          scrolled ? "py-2" : "py-4",
        )}>
        <div
          className={cn(
            "flex h-14 items-center justify-between rounded-2xl px-5 transition-all duration-300",
            scrolled || isOpen
              ? [
                  "border shadow-lg",
                  "bg-white/90 border-stone-200 shadow-stone-200/60",
                  "dark:bg-stone-900/90 dark:border-stone-800 dark:shadow-black/30",
                  "backdrop-blur-xl",
                ].join(" ")
              : "bg-transparent",
          )}>
          {/* Logo */}
          <Link
            href={session?.user ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 group"
            onClick={() => setIsOpen(false)}>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm
              bg-teal-600 dark:bg-teal-500
              group-hover:bg-teal-700 dark:group-hover:bg-teal-400
              transition-colors duration-200">
              <Briefcase className="w-4 h-4 text-white dark:text-stone-950" />
            </div>
            <span className="font-bold text-stone-900 dark:text-stone-100 text-base tracking-tight transition-colors duration-300">
              JobTracker
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {(!session?.user ? publicNav : appNav).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  pathname === item.href ||
                    pathname?.startsWith(item.href + "/")
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60",
                )}>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-2">
            {session?.user && (
              <Link href="/dashboard/jobs/new">
                <Button
                  size="sm"
                  className="rounded-lg gap-1.5 font-medium border-0 shadow-md transition-all duration-200
                    bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20
                    dark:bg-teal-500 dark:text-stone-950 dark:hover:bg-teal-400 dark:shadow-teal-500/15">
                  <Plus className="w-4 h-4" />
                  Quick Add
                </Button>
              </Link>
            )}

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
                text-stone-500 dark:text-stone-400
                hover:text-stone-900 dark:hover:text-stone-100
                hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label="Toggle theme">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
              <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
            </button>

            {session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg font-medium transition-all duration-200
                      text-stone-600 dark:text-stone-300
                      hover:text-stone-900 dark:hover:text-stone-100
                      hover:bg-stone-100 dark:hover:bg-stone-800">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="rounded-lg font-medium border-0 shadow-md transition-all duration-200
                      bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20
                      dark:bg-teal-500 dark:text-stone-950 dark:hover:bg-teal-400 dark:shadow-teal-500/15">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex lg:hidden items-center gap-1.5">
            {session?.user && (
              <Link href="/dashboard/jobs/new">
                <Button
                  size="icon"
                  className="w-8 h-8 rounded-lg border-0
                  bg-teal-600 text-white hover:bg-teal-700
                  dark:bg-teal-500 dark:text-stone-950 dark:hover:bg-teal-400">
                  <Plus className="w-4 h-4" />
                </Button>
              </Link>
            )}

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200
                text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label="Toggle theme">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
              <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
            </button>

            {session?.user && <UserMenu user={session.user} />}

            {/* Hamburger */}
            <button
              className="p-1.5 rounded-lg transition-colors duration-200
                text-stone-500 dark:text-stone-400
                hover:text-stone-900 dark:hover:text-stone-100
                hover:bg-stone-100 dark:hover:bg-stone-800"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}>
              <div className="relative w-5 h-4">
                <span
                  className={cn(
                    "absolute left-0 block w-5 h-0.5 bg-current transition-all duration-300",
                    isOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 block w-5 h-0.5 bg-current transition-all duration-300",
                    isOpen ? "opacity-0" : "opacity-100",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block w-5 h-0.5 bg-current transition-all duration-300",
                    isOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0",
                  )}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300 ease-out",
            isOpen ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0",
          )}>
          <div
            className="rounded-2xl p-3 border shadow-lg backdrop-blur-xl
            bg-white/95 border-stone-200 shadow-stone-200/60
            dark:bg-stone-900/95 dark:border-stone-800 dark:shadow-black/30">
            <div className="space-y-0.5">
              {(!session?.user ? publicNav : appNav).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                    pathname === item.href ||
                      pathname?.startsWith(item.href + "/")
                      ? "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800",
                  )}
                  onClick={() => setIsOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="h-px bg-stone-100 dark:bg-stone-800 my-3" />

            <div className="space-y-1.5">
              {session?.user ? (
                <button
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                    text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={async () => {
                    await logoutUser();
                    setIsOpen(false);
                  }}>
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl border transition-all duration-200
                      border-stone-200 text-stone-700 hover:bg-stone-50
                      dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
                    onClick={() => setIsOpen(false)}>
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200
                      bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20
                      dark:bg-teal-500 dark:text-stone-950 dark:hover:bg-teal-400"
                    onClick={() => setIsOpen(false)}>
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
