import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    }),
    prisma.userProfile.findUnique({
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
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Settings</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage your account and notification preferences.
          </p>
        </div>

        {/* ── Career profile CTA ───────────────────────────────── */}
        <Link href="/dashboard/profile">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50 hover:bg-indigo-100/80 dark:hover:bg-indigo-950/50 transition-colors group">
            <div className="h-9 w-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">Career Profile & AI</p>
              <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80">
                Target roles, CV, salary targets — powers all AI features
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* ── Account info ─────────────────────────────────────── */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <UserCircle className="h-4 w-4 text-stone-500" />
            </div>
            <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">Account information</h2>
          </div>
          <div className="p-5">
            <ProfileForm initialData={user} />
          </div>
        </div>

        {/* ── Notifications ────────────────────────────────────── */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center">
              <Bell className="h-4 w-4 text-teal-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-800 dark:text-stone-100">Notifications</h2>
              <p className="text-xs text-stone-400 mt-0.5">Weekly digest of your job pipeline nudges</p>
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
