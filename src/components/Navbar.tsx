"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import {
  User,
  Sun,
  Moon,
  Sparkles,
  LayoutDashboard,
  Settings,
  LogOut,
  Rocket,
  Plus,
  Briefcase,
} from "lucide-react";
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
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems = [
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Testimonials", href: "/#testimonials" },
    { label: "Jobs", href: "/jobs" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      {/* Dynamic animated background */}
      {scrolled && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-transparent backdrop-blur-lg" />
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-green-500/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-0 right-1/3 w-80 h-80 bg-primary/12 rounded-full blur-3xl animate-pulse" />
        </div>
      )}

      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}>
        <div
          className={`relative flex h-16 items-center justify-between rounded-2xl transition-all duration-500 ${
            scrolled || isOpen
              ? "bg-background/65 backdrop-blur-2xl border border-green-500/40 shadow-2xl shadow-green-500/10 px-6"
              : "bg-transparent px-0"
          }`}>
          {/* Logo with creative animations */}
          <Link
            href={session?.user ? "/dashboard" : "/"}
            className="flex items-center gap-3 group relative z-10"
            onClick={() => setIsOpen(false)}>
            <div className="relative">
              {/* Animated outer glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300 animate-pulse" />

              {/* Main logo */}
              <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 overflow-hidden transition-all duration-300 group-hover:scale-110 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Rocket className="w-5 h-5 text-white relative z-10 group-hover:translate-y-0.5 transition-transform duration-300" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-black text-foreground text-lg leading-none tracking-tight group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                JobTracker
              </span>
              <span className="text-[10px] text-green-600 dark:text-green-400 font-black uppercase tracking-widest mt-0.5 hidden sm:block animate-pulse">
                🇰🇪 Kenya
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 relative z-10">
            {!session?.user &&
              navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group overflow-hidden">
                  <span className="relative z-10">{item.label}</span>
                  <span className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/15 transition-colors duration-300 rounded-lg" />
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                </Link>
              ))}

            {session?.user && (
              <div className="flex items-center gap-2">
                {[
                  { href: "/dashboard/tracker", label: "Tracker" },
                  { href: "/jobs", label: "Jobs" },
                  { href: "/dashboard/profile", label: "Profile" },
                  { href: "/docs", label: "Docs" },
                  { href: "/dashboard/settings", label: "Settings" },
                ].map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 overflow-hidden group ${
                        pathname?.includes(item.label.toLowerCase())
                          ? "bg-green-500/25 text-green-600 dark:text-green-400 border border-green-500/50"
                          : "text-muted-foreground hover:text-foreground"
                      }`}>
                      <span className="relative z-10">{item.label}</span>
                      {!pathname?.includes(item.label.toLowerCase()) && (
                        <span className="absolute inset-0 bg-green-500/15 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300" />
                      )}
                    </div>
                  </Link>
                ))}
                <div className="w-px h-4 bg-gradient-to-b from-green-500/50 to-emerald-500/50 mx-2" />
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3 relative z-10">
            {session?.user && (
              <Link href="/dashboard/jobs/new">
                <Button className="rounded-lg bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white shadow-lg shadow-green-600/40 hover:shadow-xl hover:shadow-green-600/60 hover:-translate-y-1 transition-all duration-300 gap-2 h-10 px-5 border border-green-500/60 font-bold group overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Plus className="w-4 h-4 animate-bounce relative z-10" />
                  <span className="relative z-10">Quick Add</span>
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg w-10 h-10 hover:bg-green-500/20 hover:text-green-600 dark:hover:text-green-400 transition-all duration-300 relative group border border-transparent hover:border-green-500/40"
              aria-label="Toggle theme">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500 absolute" />
              <Moon className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400 absolute" />
              <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/10 transition-colors duration-300" />
            </Button>

            {!session?.user && (
              <div className="w-px h-6 bg-gradient-to-b from-green-500/40 to-emerald-500/40" />
            )}

            {session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="rounded-lg hover:bg-green-500/15 hover:text-green-600 dark:hover:text-green-400 font-bold transition-all duration-300 border border-transparent hover:border-green-500/40 hover:shadow-lg hover:shadow-green-500/10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-600/40 shadow-md hover:-translate-y-0.5 transition-all duration-300 font-bold border border-green-500/60 group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Sparkles className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Get Started</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-2 relative z-10">
            {session?.user && (
              <Link href="/dashboard/jobs/new">
                <Button
                  size="icon"
                  className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md shadow-green-600/30 w-9 h-9 border border-green-500/50 hover:shadow-lg hover:shadow-green-600/40 transition-all duration-300">
                  <Plus className="w-4 h-4" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg w-9 h-9 hover:bg-green-500/20 hover:text-green-600 dark:hover:text-green-400 transition-all duration-300 border border-transparent hover:border-green-500/40">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500 absolute" />
              <Moon className="h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400 absolute" />
            </Button>

            {session?.user && <UserMenu user={session.user} />}

            <button
              className="p-2 rounded-lg text-foreground hover:bg-green-500/15 hover:text-green-600 dark:hover:text-green-400 transition-all duration-300 border border-transparent hover:border-green-500/40"
              onClick={toggleMenu}
              aria-label={isOpen ? "Close menu" : "Open menu"}>
              <div className="relative w-6 h-6">
                <span
                  className={`absolute left-0 block w-6 h-0.5 bg-current transform transition-all duration-300 ${isOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-1"}`}
                />
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 block w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"}`}
                />
                <span
                  className={`absolute left-0 block w-6 h-0.5 bg-current transform transition-all duration-300 ${isOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-1"}`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? "max-h-[600px] opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
          <div className="bg-background/95 backdrop-blur-2xl border border-green-500/40 rounded-2xl p-4 shadow-2xl shadow-green-500/15">
            <div className="flex flex-col space-y-1">
              {!session?.user &&
                navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="px-4 py-3 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-green-500/20 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}>
                    {item.label}
                  </Link>
                ))}

              {session?.user && (
                <>
                  <Link
                    href="/dashboard/tracker"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-lg transition-colors",
                      pathname?.startsWith("/dashboard/tracker")
                        ? "bg-green-500/25 text-green-600 dark:text-green-400 border border-green-500/50"
                        : "text-muted-foreground hover:text-foreground hover:bg-green-500/20",
                    )}>
                    <LayoutDashboard className="w-4 h-4" />
                    Tracker
                  </Link>
                  <Link
                    href="/jobs"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-green-500/20 rounded-lg transition-colors">
                    <Briefcase className="w-4 h-4" />
                    Jobs
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-green-500/20 rounded-lg transition-colors">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  <Link
                    href="/docs"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-green-500/20 rounded-lg transition-colors">
                    <Briefcase className="w-4 h-4" />
                    Docs
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-green-500/20 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </>
              )}
            </div>

            <div className="h-px bg-gradient-to-r from-green-500/30 to-emerald-500/30 my-4" />

            <div className="flex flex-col gap-2">
              {session?.user ? (
                <>
                  <Link
                    href="/dashboard/jobs/new"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      buttonVariants({}),
                      "w-full justify-center bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg gap-2 hover:shadow-lg hover:shadow-green-600/30 shadow-md transition-all duration-300 font-bold border border-green-500/50",
                    )}>
                    <Plus className="w-4 h-4 animate-bounce" />
                    Quick Add Job
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full justify-center gap-2 rounded-lg border-green-500/40 hover:bg-green-500/20 hover:text-green-600 dark:hover:text-green-400 font-bold",
                    )}>
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/15 rounded-lg font-bold border border-transparent hover:border-destructive/40"
                    onClick={async () => {
                      await logoutUser();
                      setIsOpen(false);
                    }}>
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full justify-center gap-2 rounded-lg border-green-500/40 hover:bg-green-500/20 hover:text-green-600 dark:hover:text-green-400 font-bold",
                    )}>
                    <User className="w-4 h-4" />
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      buttonVariants({}),
                      "w-full justify-center bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg gap-2 hover:shadow-lg hover:shadow-green-600/30 shadow-md transition-all duration-300 font-bold border border-green-500/50",
                    )}>
                    <Sparkles className="w-4 h-4" />
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
