"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Settings, LogOut, ChevronDown, LayoutDashboard, UserCircle } from "lucide-react";
import { logoutUser } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  profileCompletionPct?: number;
}

export function UserMenu({ user, profileCompletionPct }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
  };

  // Get initials
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50 group"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {initials}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-200 z-50">
          <div className="px-3 py-2 border-b border-border/50 mb-1">
            <p className="text-sm font-medium text-foreground truncate">
              {user.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
            {profileCompletionPct !== undefined && profileCompletionPct < 100 && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Profile</span>
                  <span className="text-xs text-muted-foreground">{profileCompletionPct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-teal-500 transition-all duration-500 rounded-full"
                    style={{ width: `${profileCompletionPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <UserCircle className="w-4 h-4" />
            Career Profile
            {profileCompletionPct !== undefined && profileCompletionPct < 60 && (
              <span className="ml-auto text-xs bg-teal-500/15 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded-full">
                Incomplete
              </span>
            )}
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors mt-1"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
