import Link from "next/link";
import { getProfile } from "@/app/actions/profile";
import { Sparkles } from "lucide-react";

export async function ProfileBanner() {
  let profile = null;
  try {
    profile = await getProfile();
  } catch {
    return null;
  }

  if (!profile || profile.completionPct >= 60) return null;

  return (
    <div className="mx-4 mt-4 sm:mx-6 lg:mx-8">
      <div className="ai-panel flex items-center gap-3 px-4 py-3 text-sm">
        <Sparkles className="h-4 w-4 text-primary shrink-0" />
        <p className="text-ai-foreground flex-1">
          Your profile is {profile.completionPct}% complete.{" "}
          <Link
            href="/dashboard/profile"
            className="font-semibold underline underline-offset-2 hover:no-underline"
          >
            Add your target roles and CV
          </Link>{" "}
          to unlock AI job scoring.
        </p>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <div className="h-1.5 w-20 rounded-full bg-primary/20 overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${profile.completionPct}%` }}
            />
          </div>
          <span className="text-xs text-primary w-8 text-right">
            {profile.completionPct}%
          </span>
        </div>
      </div>
    </div>
  );
}
