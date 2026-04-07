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
  if (pct >= 90) return { label: "Full Intelligence", icon: Brain, color: "text-teal-500",  bar: "from-teal-400 to-emerald-400" };
  if (pct >= 70) return { label: "AI Documents",     icon: Wand2, color: "text-violet-500", bar: "from-violet-400 to-indigo-500" };
  if (pct >= 40) return { label: "AI Job Scoring",   icon: Sparkles, color: "text-indigo-500", bar: "from-indigo-400 to-violet-400" };
  return           { label: "Basic Tracking",       icon: Zap,  color: "text-stone-400",  bar: "from-stone-300 to-stone-400" };
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
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
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-white dark:bg-stone-950 border-r border-stone-200 dark:border-stone-800 z-40">

      {/* ── Logo ───────────────────────────────────────────────── */}
      <Link href="/dashboard" className="flex items-center gap-3 px-5 h-14 border-b border-stone-100 dark:border-stone-900 shrink-0 group">
        <div className="h-8 w-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-sm shadow-indigo-500/30 group-hover:bg-indigo-700 dark:group-hover:bg-indigo-400 transition-colors">
          <Briefcase className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-stone-900 dark:text-stone-50 text-sm tracking-tight">CareerOS</span>
      </Link>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <p className="text-[10px] font-bold tracking-widest text-stone-400 dark:text-stone-600 uppercase px-2 mb-1.5">
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
                          ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300"
                          : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-900/60"
                      )}
                    >
                      <span className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg transition-colors shrink-0",
                        active
                          ? "bg-indigo-100 dark:bg-indigo-900/60"
                          : "bg-stone-100 dark:bg-stone-800/60 group-hover:bg-stone-200 dark:group-hover:bg-stone-800"
                      )}>
                        <Icon className={cn(
                          "h-3.5 w-3.5",
                          active ? "text-indigo-600 dark:text-indigo-400" : "text-stone-500 dark:text-stone-400"
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
      <div className="mx-3 mb-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <TierIcon className={cn("h-3.5 w-3.5 shrink-0", tier.color)} />
            <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-200 truncate">
              {tier.label}
            </span>
          </div>
          <span className="text-[10px] font-bold text-stone-400">{profilePct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
          <div
            className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", tier.bar)}
            style={{ width: `${profilePct}%` }}
          />
        </div>
        {profilePct < 100 && (
          <Link href="/dashboard/profile" className="mt-2 text-[10px] font-medium text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 block hover:underline">
            {profilePct < 40 ? "Complete profile to unlock AI →" : "Unlock more AI features →"}
          </Link>
        )}
      </div>

      {/* ── User bar ───────────────────────────────────────────── */}
      <div className="px-3 py-3 border-t border-stone-100 dark:border-stone-900 flex items-center gap-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate leading-none">
              {user.name ?? user.email ?? "User"}
            </p>
            {user.name && (
              <p className="text-[10px] text-stone-400 truncate leading-tight mt-0.5">{user.email}</p>
            )}
          </div>
        </div>
        <ThemeToggle />
        <button
          onClick={() => logoutUser()}
          className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
