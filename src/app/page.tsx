/**
 * Landing page — CareerOS
 *
 * Single brand: Indigo/Violet primary — matches dashboard + CSS variable system
 * All colours use CSS variables via Tailwind semantic tokens
 */

import Link from "next/link";
import { auth } from "@/lib/auth";
import { logoutUser } from "@/app/actions/auth";
import JsonLd from "@/components/JsonLd";
import {
  Briefcase,
  LineChart,
  Bell,
  Check,
  Shield,
  Clock,
  Zap,
  Sparkles,
  Brain,
  FileText,
  Rocket,
  LogIn,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is CareerOS free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — free for every job seeker, unlimited applications, no card needed.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <JsonLd data={faqData} />

      {/* ─── HERO ─────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
        {/* Dot texture */}
        <div
          className="absolute inset-0 opacity-20 dark:opacity-[0.04] transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Brand glow — indigo instead of teal */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background/30 to-transparent pointer-events-none transition-colors duration-300" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-primary/8 blur-[140px] opacity-60 dark:opacity-40 transition-opacity duration-500 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto pt-24">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-10 text-sm font-medium
            bg-primary/8 text-primary border border-primary/20
            transition-colors duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI-powered career management — built for serious seekers
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.07] mb-6
            text-foreground transition-colors duration-300">
            Your career,
            <br />
            <span className="text-ai-gradient">finally organised.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed transition-colors duration-300">
            CareerOS tracks every application, scores jobs with AI, generates
            tailored documents, and sends smart follow-up nudges —
            automatically.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10 w-full px-4 sm:px-0">
            {!session ? (
              <>
                <Link
                  href="/register"
                  className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-lg
                    text-sm md:text-base font-semibold
                    bg-primary dark:bg-indigo-600 text-white dark:text-white
                    border border-primary dark:border-indigo-500
                    hover:bg-indigo-700 dark:hover:bg-indigo-500
                    hover:shadow-lg hover:shadow-primary/40 dark:hover:shadow-indigo-600/30
                    active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950
                    transition-all duration-150 ease-out
                    disabled:opacity-50 disabled:cursor-not-allowed">
                  <span>Start Free</span>
                  <Rocket className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </Link>
                <Link
                  href="/login"
                  className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-lg
                    text-sm md:text-base font-semibold
                    bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                    border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600
                    hover:bg-slate-50 dark:hover:bg-slate-700
                    hover:shadow-md hover:shadow-slate-200 dark:hover:shadow-slate-900/50
                    active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:focus-visible:ring-slate-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950
                    transition-all duration-150 ease-out
                    disabled:opacity-50 disabled:cursor-not-allowed">
                  <span>Sign In</span>
                  <LogIn className="w-4 h-4 opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-lg
                    text-sm md:text-base font-semibold
                    bg-primary dark:bg-indigo-600 text-white dark:text-white
                    border border-primary dark:border-indigo-500
                    hover:bg-indigo-700 dark:hover:bg-indigo-500
                    hover:shadow-lg hover:shadow-primary/40 dark:hover:shadow-indigo-600/30
                    active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950
                    transition-all duration-150 ease-out
                    disabled:opacity-50 disabled:cursor-not-allowed">
                  <span>Open Dashboard</span>
                  <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                </Link>
                <form action={logoutUser} className="w-full sm:w-auto">
                  <button
                    type="submit"
                    className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-lg w-full
                       text-sm md:text-base font-semibold
                       bg-red-600 dark:bg-red-700 text-white dark:text-white
                       border border-red-600 dark:border-red-600
                       hover:bg-red-700 dark:hover:bg-red-600
                       hover:shadow-lg hover:shadow-red-600/30 dark:hover:shadow-red-700/30
                       active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:focus-visible:ring-red-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950
                       transition-all duration-150 ease-out
                       disabled:opacity-50 disabled:cursor-not-allowed">
                    <span>Logout</span>
                    <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground transition-colors duration-300">
            {[
              { icon: Check, label: "Free forever" },
              { icon: Shield, label: "No card required" },
              { icon: Clock, label: "Setup in 2 min" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-primary/70" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-5 h-8 rounded-full border-2 border-border flex justify-center transition-colors duration-300">
            <div className="w-1 h-2 rounded-full bg-primary mt-1.5 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────── */}
      <div className="border-y border-border bg-card transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "10K+", label: "Jobs tracked" },
            { value: "87%", label: "Fewer missed follow-ups" },
            { value: "3×", label: "Faster than spreadsheets" },
            { value: "Free", label: "No strings attached" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl sm:text-3xl font-bold text-primary transition-colors duration-300">
                {value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FEATURES ─────────────────────────────── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3 transition-colors duration-300">
              What you get
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground transition-colors duration-300">
              Built for the modern job search
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                Icon: LineChart,
                title: "Visual Pipeline",
                desc: "One clean board — Wishlist, Applied, Interview, Offer. Every application visible, nothing forgotten.",
              },
              {
                Icon: Bell,
                title: "Smart Nudges",
                desc: "AI-powered follow-up reminders arrive exactly when you need them. Silence never means rejection again.",
              },
              {
                Icon: Zap,
                title: "Quick Add",
                desc: "Log a new job in under 30 seconds. Company, role, deadline, notes — before the tab even closes.",
              },
              {
                Icon: Brain,
                title: "AI Job Scoring",
                desc: "Instant match scores based on your profile. Know which jobs are worth your time before you apply.",
              },
              {
                Icon: FileText,
                title: "Document Generation",
                desc: "Tailored cover letters and resume bullets generated by AI — personalised to each job description.",
              },
              {
                Icon: Sparkles,
                title: "Interview Prep",
                desc: "AI-generated STAR stories and prep packs so you walk into every interview fully prepared.",
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="group p-7 rounded-lg border transition-all duration-300
                  border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                {/* Accent bar */}
                <div className="w-8 h-0.5 rounded-full mb-6 bg-border group-hover:bg-primary transition-colors duration-300" />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5
                  bg-muted group-hover:bg-primary/10 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 transition-colors duration-300">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────── */}
      <section
        id="how-it-works"
        className="py-28 px-6 bg-muted/40 transition-colors duration-300">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3 transition-colors duration-300">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground transition-colors duration-300">
              Simple by design
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                n: "1",
                title: "Log as you apply",
                desc: "Add the company, role, and deadline while the tab is still open. Thirty seconds, done.",
              },
              {
                n: "2",
                title: "Let AI score your matches",
                desc: "CareerOS analyses every job against your profile and highlights the best opportunities automatically.",
              },
              {
                n: "3",
                title: "Get timely nudges",
                desc: "When it's time to follow up, you'll know exactly what to do — and the AI will help you write it.",
              },
              {
                n: "4",
                title: "Walk in prepared",
                desc: "Instant interview prep packs with STAR stories tailored to the specific role you're interviewing for.",
              },
            ].map(({ n, title, desc }) => (
              <div
                key={n}
                className="flex gap-6 items-start p-7 rounded-lg border transition-all duration-300
                  bg-card border-border hover:border-primary/30">
                <div
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                  bg-primary text-primary-foreground shadow-md shadow-primary/20
                  transition-colors duration-300">
                  {n}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1 transition-colors duration-300">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-2xl mx-auto">
          <div
            className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-center"
            style={{
              background:
                "linear-gradient(135deg, hsl(239 84% 55%) 0%, hsl(270 90% 65%) 100%)",
            }}>
            {/* Dot texture overlay */}
            <div
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />

            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-white/10 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight
                text-white">
                Your next role is
                <br />
                <span className="text-white/80">already out there.</span>
              </h2>

              <p className="mb-8 leading-relaxed max-w-md mx-auto text-white/70">
                Stop letting opportunities slip through the cracks. Start
                tracking with a system that actually works.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center w-full px-4 sm:px-0">
                {!session ? (
                  <>
                    <Link
                      href="/register"
                      className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-lg
                        text-sm md:text-base font-semibold
                        bg-white text-indigo-600
                        border border-white hover:border-white/90
                        hover:bg-white/95 hover:shadow-xl hover:shadow-white/20
                        active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600
                        transition-all duration-150 ease-out
                        disabled:opacity-50 disabled:cursor-not-allowed">
                      <span>Get Started Free</span>
                      <Rocket className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200" />
                    </Link>
                    <Link
                      href="/login"
                      className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-lg
                        text-sm md:text-base font-semibold
                        bg-white/10 text-white
                        border border-white/30 hover:border-white/50
                        hover:bg-white/15 hover:shadow-lg hover:shadow-white/10
                        active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600
                        transition-all duration-150 ease-out
                        disabled:opacity-50 disabled:cursor-not-allowed">
                      <span>Sign In</span>
                      <LogIn className="w-4 h-4 opacity-75 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-lg
                        text-sm md:text-base font-semibold
                        bg-white text-indigo-600
                        border border-white hover:border-white/90
                        hover:bg-white/95 hover:shadow-xl hover:shadow-white/20
                        active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600
                        transition-all duration-150 ease-out
                        disabled:opacity-50 disabled:cursor-not-allowed">
                      <span>Go to Dashboard</span>
                      <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    </Link>
                    <form action={logoutUser} className="w-full sm:w-auto">
                      <button
                        type="submit"
                        className="group relative inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-lg w-full
                          text-sm md:text-base font-semibold
                          bg-white/10 text-white
                          border border-white/30 hover:border-white/60
                          hover:bg-white/15 hover:shadow-lg hover:shadow-red-500/20
                          active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600
                          transition-all duration-150 ease-out
                          disabled:opacity-50 disabled:cursor-not-allowed">
                        <span>Logout</span>
                        <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </button>
                    </form>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-white/60">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> Free forever
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> No card required
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> 2-minute setup
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────── */}
      <footer className="border-t border-border py-10 px-6 transition-colors duration-300">
        <div
          className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4
          text-sm text-muted-foreground transition-colors duration-300">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center
              bg-primary transition-colors duration-300">
              <Briefcase className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground/70 transition-colors duration-300">
              CareerOS
            </span>
          </div>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-muted-foreground hover:text-foreground hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background rounded px-1 transition-all duration-200">
                {item}
              </Link>
            ))}
          </div>
          <span>© {new Date().getFullYear()} CareerOS</span>
        </div>
      </footer>
    </div>
  );
}
