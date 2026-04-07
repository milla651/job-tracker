import Link from "next/link";
import { getProfile } from "@/app/actions/profile";
import { Sparkles, X } from "lucide-react";

/**
 * Server component — fetches profile and shows a banner if < 60% complete.
 * Shown once per dashboard visit; user can dismiss (client-side hide via CSS).
 */
export async function ProfileBanner() {
  let profile = null;
  try {
    profile = await getProfile();
  } catch {
    // Tables not migrated yet — silently skip the banner
    return null;
  }

  // Don't show if profile is complete enough or doesn't exist yet
  if (!profile || profile.completionPct >= 60) return null;

  return (
    <div className="mx-4 mt-4 sm:mx-6 lg:mx-8">
      <div className="flex items-center gap-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/60 px-4 py-3 text-sm">
        <Sparkles className="h-4 w-4 text-teal-500 shrink-0" />
        <p className="text-teal-800 dark:text-teal-200 flex-1">
          Your profile is {profile.completionPct}% complete.{" "}
          <Link
            href="/dashboard/profile"
            className="font-semibold underline underline-offset-2 hover:no-underline"
          >
            Add your target roles and CV
          </Link>{" "}
          to unlock AI job scoring.
        </p>
        {/* Completion bar */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="h-1.5 w-20 rounded-full bg-teal-200 dark:bg-teal-800 overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all"
              style={{ width: `${profile.completionPct}%` }}
            />
          </div>
          <span className="text-xs text-teal-600 dark:text-teal-400 w-8 text-right">
            {profile.completionPct}%
          </span>
        </div>
      </div>
    </div>
  );
}
