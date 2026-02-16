"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Menu, X, User, Sun, Moon, Sparkles, LayoutDashboard, Settings, LogOut, Plus, Rocket, Heart, Briefcase } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems = [
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Testimonials", href: "/#testimonials" },
    { label: "Jobs", href: "/jobs" },
  ];

  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || isOpen
        ? 'py-2'
        : 'py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative flex h-16 items-center justify-between rounded-2xl transition-all duration-500 ${scrolled || isOpen
            ? 'bg-background/80 backdrop-blur-md border border-border/40 shadow-sm px-6 supports-[backdrop-filter]:bg-background/60'
            : 'bg-transparent px-0'
            }`}
        >
          {/* Logo */}
          <Link
            href={session?.user ? "/dashboard" : "/"}
            className="flex items-center gap-3 group"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary to-accent transition-transform duration-300 group-hover:scale-105 shadow-lg shadow-primary/20">
              <Rocket className="w-5 h-5 text-white fill-white/20" />
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground text-lg leading-none tracking-tight">
                JobTracker
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5 hidden sm:block">
                Career Companion
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {!session?.user && navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                {item.label}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-1/2 transition-all duration-300 rounded-full opacity-0 group-hover:opacity-100" />
              </Link>
            ))}

            {session?.user && (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/tracker"
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    pathname?.startsWith("/dashboard/tracker")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  Tracker
                </Link>
                <Link
                  href="/jobs"
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    pathname === "/jobs"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  Jobs
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                >
                  Profile
                </Link>
                <Link
                  href="/docs"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                >
                  Docs
                </Link>
                <Link
                  href="/dashboard/settings"
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    pathname === "/dashboard/settings"
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  Settings
                </Link>
                <div className="w-px h-4 bg-border/50 mx-2" />
              </div>
            )}
          </div>


          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {session?.user && (
              <Link href="/dashboard/jobs/new">
                <Button
                  size="sm"
                  className="rounded-xl bg-gradient-brand text-white shadow-lg hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 gap-2 h-10 px-5"
                >
                  <Plus className="w-4 h-4" />
                  <span className="font-semibold">Quick Add</span>
                </Button>
              </Link>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full w-10 h-10 hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="Toggle theme"
            >
              {mounted ? (
                <>
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
                </>
              ) : (
                <div className="h-5 w-5" />
              )}
            </Button>

            {!session?.user && <div className="w-px h-6 bg-border mx-1" />}

            {session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="rounded-xl hover:bg-primary/5 hover:text-primary">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-xl bg-primary text-white hover:bg-primary/90 shadow-md">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-2">
            {session?.user && (
              <Link href="/dashboard/jobs/new">
                <Button
                  size="icon"
                  className="rounded-full bg-gradient-brand text-white shadow-md w-9 h-9"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full w-9 h-9 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {mounted ? (
                <>
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
                </>
              ) : (
                <div className="h-4 w-4" />
              )}
            </Button>

            {session?.user && <UserMenu user={session.user} />}

            <button
              className="p-2 rounded-xl text-foreground hover:bg-muted transition-colors"
              onClick={toggleMenu}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute left-0 block w-6 h-0.5 bg-current transform transition-all duration-300 ${isOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-1'
                    }`}
                />
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 block w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                    }`}
                />
                <span
                  className={`absolute left-0 block w-6 h-0.5 bg-current transform transition-all duration-300 ${isOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-1'
                    }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isOpen ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="bg-background/95 backdrop-blur-xl border border-border/40 rounded-2xl p-4 shadow-xl">
            <div className="flex flex-col space-y-1">
              {!session?.user && navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <Link
                href="/dashboard/tracker"
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                  pathname?.startsWith("/dashboard/tracker") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                Tracker
              </Link>
              <Link
                href="/jobs"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                Jobs
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <Link
                href="/docs"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                Docs
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </div>

            <div className="h-px bg-border/50 my-4" />

            <div className="flex flex-col gap-2 ">
              {session?.user ? (
                <>
                  <Link
                    href="/dashboard/jobs/new"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      buttonVariants({}),
                      "w-full justify-center bg-gradient-brand text-white rounded-xl gap-2 hover:opacity-90 shadow-lg"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                    Quick Add Job
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full justify-center gap-2 rounded-xl border-border/50 hover:bg-muted/50"
                    )}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    onClick={async () => {
                      await logoutUser();
                      setIsOpen(false);
                    }}
                  >
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
                      "w-full justify-center gap-2 rounded-xl border-border/50"
                    )}
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      buttonVariants({}),
                      "w-full justify-center bg-gradient-brand text-white rounded-xl gap-2 hover:opacity-90 shadow-lg"
                    )}
                  >
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
