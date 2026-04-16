import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileForm } from "@/components/ProfileForm";
import { NudgeEmailSettings } from "@/components/settings/NudgeEmailSettings";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, ChevronRight, Bell, UserCircle } from "lucide-react";

export const metadata = { title: "Settings — CareerOS" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, profile] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    }),
    db.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { emailNudgesEnabled: true },
    }),
  ]);

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ───────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account and notification preferences.
          </p>
        </div>

        {/* ── Career profile CTA ───────────────────────────────── */}
        <Link href="/dashboard/profile">
          <div className="ai-panel flex items-center gap-3 p-4 hover:bg-ai-border/10 transition-colors group cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ai-foreground">Career Profile & AI</p>
              <p className="text-xs text-muted-foreground">
                Target roles, CV, salary targets — powers all AI features
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* ── Account info ─────────────────────────────────────── */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <UserCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Account information</h2>
          </div>
          <div className="p-5">
            <ProfileForm initialData={user} />
          </div>
        </div>

        {/* ── Notifications ────────────────────────────────────── */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Weekly digest of your job pipeline nudges</p>
            </div>
          </div>
          <div className="p-5">
            <NudgeEmailSettings enabled={profile?.emailNudgesEnabled ?? true} />
          </div>
        </div>

      </div>
    </div>
  );
}
