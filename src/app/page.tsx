/**
 * Landing page — JobTracker
 *
 * Palette:
 *   Light → stone-50 bg · stone-900 text · teal-600 accent
 *   Dark  → stone-950 bg · stone-100 text · teal-400 accent
 *
 * All colours use Tailwind dark: classes so the theme toggle
 * affects the ENTIRE page, not just the nav.
 */

import Link from "next/link";
import JsonLd from "@/components/JsonLd";
// import { cn } from "@/lib/utils";
import {
  Briefcase,
  LineChart,
  Bell,
  ArrowRight,
  Check,
  Shield,
  Clock,
  Zap,
  ArrowUpRight,
} from "lucide-react";

export default async function HomePage() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is JobTracker free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — free for every job seeker, unlimited applications, no card needed.",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300">
      <JsonLd data={faqData} />

      {/* ─── HERO ─────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
        {/* Light mode warm dot texture */}
        <div
          className="absolute inset-0 opacity-25 dark:opacity-0 transition-opacity duration-500 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #d6d3d1 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Light mode warm top wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-50/70 via-stone-50/30 to-transparent dark:from-transparent pointer-events-none transition-colors duration-300" />

        {/* Dark mode teal glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-teal-600/10 blur-[140px] opacity-0 dark:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative max-w-3xl mx-auto pt-24">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-10 text-sm font-medium
            bg-teal-50 text-teal-700 border border-teal-200/80
            dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/60
            transition-colors duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            Automated job tracking — built for serious seekers
          </div>

          {/* Headline — serif creates warmth, memorability, editorial feel */}
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight leading-[1.07] mb-6
            text-stone-900 dark:text-stone-50 transition-colors duration-300">
            Your job search,
            <br />
            <span className="text-teal-600 dark:text-teal-400 transition-colors duration-300">
              finally in order.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-stone-500 dark:text-stone-400 max-w-xl mx-auto mb-10 leading-relaxed transition-colors duration-300">
            Stop losing track. JobTracker organises every application, sends
            smart follow-up reminders, and shows your full pipeline —
            automatically.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            {/* Primary */}
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl
                text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0
                bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/25
                dark:bg-teal-500 dark:text-stone-950 dark:hover:bg-teal-400 dark:shadow-teal-500/20">
              Start Tracking Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            {/* Secondary */}
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl
                text-base font-semibold transition-all duration-200
                border-2 border-stone-300 text-stone-700 hover:bg-stone-100 hover:border-stone-400
                dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:border-stone-600">
              Sign In
            </Link>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-stone-400 dark:text-stone-600 transition-colors duration-300">
            {[
              { icon: Check, label: "Free forever" },
              { icon: Shield, label: "No card required" },
              { icon: Clock, label: "Setup in 2 min" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-teal-500 dark:text-teal-600" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-5 h-8 rounded-full border-2 border-stone-300 dark:border-stone-700 flex justify-center transition-colors duration-300">
            <div className="w-1 h-2 rounded-full bg-teal-500 mt-1.5 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────── */}
      <div className="border-y border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: "10K+", label: "Jobs tracked" },
            { value: "87%", label: "Fewer missed follow-ups" },
            { value: "3×", label: "Faster than spreadsheets" },
            { value: "Free", label: "No strings attached" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-teal-600 dark:text-teal-400 transition-colors duration-300">
                {value}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-500 mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FEATURES ─────────────────────────────── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-widest mb-3 transition-colors duration-300">
              What you get
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 transition-colors duration-300">
              Built for the job search
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                Icon: LineChart,
                title: "Visual Pipeline",
                desc: "One clean board — Applied, Interview, Offer, Closed. Every application visible, nothing forgotten.",
              },
              {
                Icon: Bell,
                title: "Follow-up Reminders",
                desc: "Automated nudges when it's time to reach back out. Silence never means rejection again.",
              },
              {
                Icon: Zap,
                title: "Quick Add",
                desc: "Log a new job in under 30 seconds. Company, role, deadline, notes — before the tab even closes.",
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="group p-7 rounded-2xl border transition-all duration-300
                  border-stone-200 bg-white hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/5
                  dark:border-stone-800 dark:bg-stone-900 dark:hover:border-teal-800 dark:hover:shadow-teal-500/5">
                {/* Accent top bar */}
                <div className="w-8 h-0.5 rounded-full mb-6 bg-stone-200 group-hover:bg-teal-500 dark:bg-stone-700 dark:group-hover:bg-teal-500 transition-colors duration-300" />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5
                  bg-stone-100 dark:bg-stone-800 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/50
                  transition-colors duration-300">
                  <Icon className="w-5 h-5 text-stone-500 dark:text-stone-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2 transition-colors duration-300">
                  {title}
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-500 leading-relaxed">
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
        className="py-28 px-6 bg-stone-100/60 dark:bg-stone-900/40 transition-colors duration-300">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-widest mb-3 transition-colors duration-300">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 transition-colors duration-300">
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
                title: "Get timely nudges",
                desc: "JobTracker watches the clock. When it's time to follow up, you'll know exactly what to do.",
              },
              {
                n: "3",
                title: "Focus on getting hired",
                desc: "Drag cards through your pipeline, not your brain. Your full search, visible in one glance.",
              },
            ].map(({ n, title, desc }) => (
              <div
                key={n}
                className="flex gap-6 items-start p-7 rounded-2xl border transition-all duration-300
                  bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800
                  hover:border-teal-200 dark:hover:border-teal-900">
                <div
                  className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                  bg-teal-600 text-white shadow-md shadow-teal-600/20
                  dark:bg-teal-500 dark:text-stone-950 dark:shadow-teal-500/15
                  transition-colors duration-300">
                  {n}
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1 transition-colors duration-300">
                    {title}
                  </h3>
                  <p className="text-sm text-stone-500 dark:text-stone-500 leading-relaxed">
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
            className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-center
            bg-teal-600 dark:bg-stone-900 border-0 dark:border dark:border-teal-800/50
            transition-colors duration-300">
            {/* Dot texture overlay */}
            <div
              className="absolute inset-0 opacity-[0.06] dark:opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                backgroundSize: "20px 20px",
              }}
            />

            {/* Dark mode teal ambient glow */}
            <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-teal-600/15 rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-5 leading-tight
                text-white dark:text-stone-100 transition-colors duration-300">
                Your next role is
                <br />
                <span className="text-teal-100 dark:text-teal-400 transition-colors duration-300">
                  already out there.
                </span>
              </h2>

              <p
                className="mb-8 leading-relaxed max-w-md mx-auto
                text-teal-100 dark:text-stone-400 transition-colors duration-300">
                Stop letting opportunities slip through the cracks. Start
                tracking with a system that actually works.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {/* Primary — inverted in light, teal in dark */}
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl
                    text-base font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0
                    bg-white text-teal-700 hover:bg-teal-50 shadow-lg shadow-black/10
                    dark:bg-teal-600 dark:text-white dark:hover:bg-teal-500 dark:shadow-teal-600/20">
                  Get Started Free
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                {/* Ghost */}
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl
                    text-base font-semibold transition-all duration-200
                    border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50
                    dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:border-stone-600">
                  Sign In
                </Link>
              </div>

              <div
                className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm
                text-teal-200/80 dark:text-stone-600 transition-colors duration-300">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Free forever
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  No card required
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  2-minute setup
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────── */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-10 px-6 transition-colors duration-300">
        <div
          className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4
          text-sm text-stone-400 dark:text-stone-600 transition-colors duration-300">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center
              bg-teal-600 dark:bg-teal-500 transition-colors duration-300">
              <Briefcase className="w-3.5 h-3.5 text-white dark:text-stone-950" />
            </div>
            <span className="font-semibold text-stone-600 dark:text-stone-400 transition-colors duration-300">
              JobTracker
            </span>
          </div>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="hover:text-stone-700 dark:hover:text-stone-300 transition-colors duration-200">
                {item}
              </Link>
            ))}
          </div>
          <span>© {new Date().getFullYear()} JobTracker</span>
        </div>
      </footer>
    </div>
  );
}
