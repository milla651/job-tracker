"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Menu, X, User, Sun, Moon, Sparkles, LayoutDashboard, Settings, LogOut } from "lucide-react";
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
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? 'py-2'
        : 'py-4'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex h-14 items-center justify-between rounded-2xl transition-all duration-500 ${scrolled
            ? 'bg-background/80 backdrop-blur-xl border border-border/40 px-6 shadow-md'
            : 'bg-transparent px-0'
            }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary to-accent transition-transform duration-300 group-hover:scale-105">
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground text-lg leading-tight tracking-tight">
                JobTracker
              </span>
              <span className="text-[10px] text-muted-foreground font-medium leading-tight hidden sm:block">
                Your Career Companion
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-4/5 transition-all duration-300 rounded-full" />
              </Link>
            ))}
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 text-white shadow-lg shadow-primary/25 rounded-xl gap-2 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </div>


          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full w-9 h-9 hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="Toggle theme"
            >
              {mounted ? (
                <>
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </>
              ) : (
                <div className="h-4 w-4" />
              )}
            </Button>

            <div className="w-px h-6 bg-border" />



            {session?.user ? (
              <UserMenu user={session.user} />
            ) : (
              <div className="group flex items-center p-1 bg-background/60 border border-border/40 rounded-full backdrop-blur-md hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <Link
                  href="/login"
                  className="px-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "rounded-full bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 text-white shadow-lg shadow-primary/25 gap-2 px-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full w-9 h-9 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {mounted ? (
                <>
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
          className={`lg:hidden overflow-hidden transition-all duration-500 ease-out ${isOpen ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="bg-background/95 backdrop-blur-2xl border border-border/60 rounded-2xl p-4 shadow-2xl">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => (
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
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className={cn(
                  buttonVariants({}),
                  "w-full justify-center bg-gradient-to-r from-primary to-accent text-white rounded-xl gap-2 hover:opacity-90"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                {session?.user ? "Dashboard" : "Go to Dashboard"}
              </Link>
            </div>

            <div className="h-px bg-border my-4" />

            <div className="flex flex-col gap-2 ">
              {session?.user && (
                <div className="px-4 py-2 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {session.user.name ? session.user.name[0].toUpperCase() : "U"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{session.user.name}</span>
                    <span className="text-xs text-muted-foreground">{session.user.email}</span>
                  </div>
                </div>
              )}



              {session?.user ? (
                <>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full justify-center gap-2 rounded-xl"
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
                      "w-full justify-center gap-2 rounded-xl"
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
                      "w-full justify-center bg-gradient-to-r from-primary to-accent text-white rounded-xl gap-2 hover:opacity-90"
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
