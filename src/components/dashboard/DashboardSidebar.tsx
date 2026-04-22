"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { logoutUser } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Telescope,
  Columns3,
  ClipboardList,
  BookOpen,
  UserCircle,
  Settings,
  Sun,
  Moon,
  LogOut,
  Briefcase,
  Zap,
  Sparkles,
  Wand2,
  Brain,
} from "lucide-react";

interface DashboardSidebarProps {
  user: { name?: string | null; email?: string | null };
  profilePct: number;
}

const NAV = [
  {
    section: "Workspace",
    items: [
      { label: "Dashboard",     href: "/dashboard",          icon: LayoutDashboard, exact: true },
      { label: "Discover Jobs", href: "/dashboard/explore",  icon: Telescope },
      { label: "Pipeline",      href: "/dashboard/pipeline", icon: Columns3 },
      { label: "Applications",  href: "/dashboard/activity", icon: ClipboardList },
    ],
  },
  {
    section: "Career",
    items: [
      { label: "Story Bank",    href: "/dashboard/stories", icon: BookOpen },
      { label: "My Profile",    href: "/dashboard/profile", icon: UserCircle },
      { label: "Settings",      href: "/dashboard/settings", icon: Settings },
    ],
  },
];

// AI tier unlock info
function aiTier(pct: number) {
  if (pct >= 90) return { label: "Full Intelligence", icon: Brain,    color: "text-primary", bar: "from-gradient-1 to-gradient-2" };
  if (pct >= 70) return { label: "AI Documents",     icon: Wand2,    color: "text-primary", bar: "from-gradient-1 to-gradient-2" };
  if (pct >= 40) return { label: "AI Job Scoring",   icon: Sparkles, color: "text-primary", bar: "from-gradient-1 to-gradient-2" };
  return           { label: "Basic Tracking",       icon: Zap,      color: "text-muted-foreground", bar: "from-muted-foreground/40 to-muted-foreground/60" };
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label="Toggle theme"
    >
      <Sun  className="h-4 w-4 absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="h-4 w-4 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="h-4 w-4 block" aria-hidden />
    </button>
  );
}

export function DashboardSidebar({ user, profilePct }: DashboardSidebarProps) {
  const pathname = usePathname();
  const tier = aiTier(profilePct);
  const TierIcon = tier.icon;

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? "U").toUpperCase();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-card border-r border-border z-40">

      {/* ── Logo ───────────────────────────────────────────────── */}
      <Link href="/dashboard" className="flex items-center gap-3 px-5 h-14 border-b border-border/50 shrink-0 group">
        <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/30 group-hover:bg-primary-hover transition-colors">
          <Briefcase className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-foreground text-sm tracking-tight">CareerOS</span>
      </Link>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <p className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase px-2 mb-1.5">
              {section}
            </p>
            <ul className="space-y-0.5">
              {items.map(({ label, href, icon: Icon, exact }) => {
                const active = isActive(href, exact);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <span className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg transition-colors shrink-0",
                        active
                          ? "bg-primary/15"
                          : "bg-muted group-hover:bg-muted/80"
                      )}>
                        <Icon className={cn(
                          "h-3.5 w-3.5",
                          active ? "text-primary" : "text-muted-foreground"
                        )} />
                      </span>
                      {label}
                      {href === "/dashboard/profile" && profilePct < 80 && (
                        <span className="ml-auto text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                          {profilePct}%
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── AI tier card ───────────────────────────────────────── */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <TierIcon className={cn("h-3.5 w-3.5 shrink-0", tier.color)} />
            <span className="text-[11px] font-semibold text-foreground truncate">
              {tier.label}
            </span>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground">{profilePct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", tier.bar)}
            style={{ width: `${profilePct}%` }}
          />
        </div>
        {profilePct < 100 && (
          <Link href="/dashboard/profile" className="mt-2 text-[10px] font-medium text-primary hover:underline block">
            {profilePct < 40 ? "Complete profile to unlock AI →" : "Unlock more AI features →"}
          </Link>
        )}
      </div>

      {/* ── User bar ───────────────────────────────────────────── */}
      <div className="px-3 py-3 border-t border-border/50 flex items-center gap-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-gradient-2 flex items-center justify-center text-primary-foreground text-[10px] font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate leading-none">
              {user.name ?? user.email ?? "User"}
            </p>
            {user.name && (
              <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">{user.email}</p>
            )}
          </div>
        </div>
        <ThemeToggle />
        <form action={logoutUser}>
          <button
            type="submit"
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}
