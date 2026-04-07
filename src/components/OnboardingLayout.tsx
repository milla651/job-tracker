"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Briefcase, LayoutDashboard, Bell, Zap } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// JourneyStep — progress indicator + page title shown above the form
// ─────────────────────────────────────────────────────────────

interface JourneyStepProps {
  current: number;
  total: number;
  title: string;
  description?: string;
}

export function JourneyStep({
  current,
  total,
  title,
  description,
}: JourneyStepProps) {
  return (
    <div className="space-y-3 mb-8">
      {/* Animated progress pills */}
      <div className="flex gap-1.5 items-center">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              i < current
                ? "bg-primary w-7"
                : "bg-border w-3",
            )}
          />
        ))}
        <span className="ml-1 text-xs font-bold text-muted-foreground">
          {current}/{total}
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground transition-colors duration-300">
        {title}
      </h1>

      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// OnboardingLayout — dark branded panel left, form right
// ─────────────────────────────────────────────────────────────

interface OnboardingLayoutProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  title: string;
  description?: string;
  showBenefits?: boolean;
}

export function OnboardingLayout({
  children,
  step,
  totalSteps,
  title,
  description,
  showBenefits = true,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background transition-colors duration-300">
      {/* ────────────────────────────────────────────
          LEFT PANEL — Branding + feature highlights
          Dark always, independent of theme toggle
          so it reads as a bold visual anchor.
          Hidden on mobile (form takes full screen).
      ──────────────────────────────────────────── */}
      {showBenefits && (
        <div
          className="hidden lg:flex lg:w-[42%] xl:w-[40%] flex-col justify-between
          p-12 xl:p-16 relative overflow-hidden bg-card dark:bg-surface-raised"
          style={{ background: "linear-gradient(160deg, hsl(239 84% 12%) 0%, hsl(240 8% 6%) 100%)" }}>
          {/* Dot texture */}
          <div
            className="absolute inset-0 opacity-[0.045] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }}
          />

          {/* Brand ambient glow */}
          <div
            className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full
            bg-primary/8 blur-[110px] pointer-events-none"
          />
          <div
            className="absolute bottom-0 right-0 w-72 h-72 rounded-full
            bg-gradient-2/6 blur-[80px] pointer-events-none"
          />

          {/* Logo */}
          <div className="relative flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center
              shadow-md shadow-primary/40">
              <Briefcase className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              CareerOS
            </span>
          </div>

          {/* Hero copy + features */}
          <div className="relative space-y-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
                Built for your success
              </p>
              <h2 className="text-3xl xl:text-4xl font-bold text-white leading-snug">
                Your career,
                <br />
                <span className="text-ai-gradient">finally organised.</span>
              </h2>
              <p className="mt-4 text-sm text-white/40 leading-relaxed max-w-xs">
                Stop juggling spreadsheets. Track every application, follow up
                at the right time, and land your next role faster.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  Icon: LayoutDashboard,
                  title: "Visual Pipeline",
                  desc: "Every application on one board — from applied to offer.",
                },
                {
                  Icon: Bell,
                  title: "Smart Reminders",
                  desc: "Automated nudges so no opportunity ever goes cold.",
                },
                {
                  Icon: Zap,
                  title: "Quick Add",
                  desc: "Log a new job in under 30 seconds, no friction.",
                },
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div
                    className="shrink-0 w-9 h-9 rounded-lg
                    bg-primary/15 border border-primary/20
                    flex items-center justify-center mt-0.5">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white mb-0.5">
                      {title}
                    </p>
                    <p className="text-xs text-white/40 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="relative border-t border-white/10 pt-7">
            <p className="text-sm text-white/40 italic leading-relaxed">
              &quot;Finally a tracker that doesn&lsquo;t feel like doing extra homework.&quot;
            </p>
            <p className="text-xs text-white/25 mt-2 font-semibold">
              — Wanjiku M., hired at Safaricom
            </p>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────
          RIGHT PANEL — Form
          Responds to light/dark theme toggle.
      ──────────────────────────────────────────── */}
      <div
        className="flex-1 flex flex-col justify-center
        px-6 sm:px-10 lg:px-14 xl:px-20 py-12 lg:py-0">
        {/* Mobile-only logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-10">
          <div
            className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
            <Briefcase className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-base transition-colors duration-300">
            CareerOS
          </span>
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <JourneyStep
            current={step}
            total={totalSteps}
            title={title}
            description={description}
          />
          {children}
        </div>
      </div>
    </div>
  );
}
