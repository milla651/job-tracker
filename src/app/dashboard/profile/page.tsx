import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/actions/profile";
import { ProfileWizard } from "@/components/profile/ProfileWizard";
import { Sparkles, Zap, Brain, Wand2, Trophy, CheckCircle2, Lock } from "lucide-react";

export const metadata = { title: "Career Profile — CareerOS" };

const TIERS = [
  {
    pct: 0,
    label: "Basic tracking",
    icon: Zap,
    color: "text-stone-500",
    bg: "bg-stone-100 dark:bg-stone-800",
    features: ["Track applications", "Kanban pipeline", "Timeline history"],
  },
  {
    pct: 40,
    label: "AI Job Scoring",
    icon: Sparkles,
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/50",
    features: ["AI match score (A–F)", "Strengths & gap analysis", "Salary signal vs target"],
  },
  {
    pct: 70,
    label: "AI Documents",
    icon: Wand2,
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    features: ["Tailored cover letters", "ATS-optimised resume", "Interview prep packages"],
  },
  {
    pct: 90,
    label: "Full Intelligence",
    icon: Brain,
    color: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    features: ["Negotiation scripts", "CV rewrite suggestions", "STAR story matching"],
  },
];

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profile = await getProfile();
  const pct = profile?.completionPct ?? 0;

  const nextTier = TIERS.slice().reverse().find((t) => pct < t.pct);
  const pctToNext = nextTier ? nextTier.pct - pct : 0;

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ───────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Career Profile</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            The richer your profile, the smarter CareerOS becomes for you.
          </p>
        </div>

        {/* ── Completion bar ───────────────────────────────────── */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">Profile completeness</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{pct}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          {nextTier ? (
            <p className="text-xs text-stone-500 dark:text-stone-400">
              <span className="font-semibold text-indigo-500">{pctToNext}% more</span>
              {" "}to unlock{" "}
              <span className="font-semibold text-stone-700 dark:text-stone-200">{nextTier.label}</span>
            </p>
          ) : (
            <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400 font-semibold">
              <Trophy className="h-4 w-4" />
              Full intelligence unlocked — all AI features are active!
            </div>
          )}
        </div>

        {/* ── Unlock tiers ─────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-3">
          {TIERS.map((tier) => {
            const unlocked = pct >= tier.pct;
            const Icon = tier.icon;
            return (
              <div
                key={tier.pct}
                className={`rounded-2xl border p-4 transition-all ${
                  unlocked
                    ? "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
                    : "border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-950/50 opacity-55"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${unlocked ? tier.bg : "bg-stone-100 dark:bg-stone-800"}`}>
                    {unlocked
                      ? <Icon className={`h-4 w-4 ${tier.color}`} />
                      : <Lock className="h-4 w-4 text-stone-400" />
                    }
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                      {tier.pct === 0 ? "Included" : `At ${tier.pct}%`}
                    </p>
                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">{tier.label}</p>
                  </div>
                  {unlocked && <CheckCircle2 className="h-4 w-4 text-teal-500 ml-auto shrink-0" />}
                </div>
                <ul className="space-y-1.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <div className={`h-1 w-1 rounded-full shrink-0 ${unlocked ? "bg-teal-400" : "bg-stone-300 dark:bg-stone-700"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* ── Profile wizard ─────────────────────────────────────── */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8">
          <ProfileWizard existingProfile={profile} />
        </div>

      </div>
    </div>
  );
}
