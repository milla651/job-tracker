"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface JourneyStepProps {
  current: number;
  total: number;
  title: string;
  description?: string;
}

/**
 * Visual journey indicator to guide users through their workflow
 */
export function JourneyStep({
  current,
  total,
  title,
  description,
}: JourneyStepProps) {
  return (
    <div className="space-y-2 mb-8">
      {/* Progress Bar */}
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all",
              i < current ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>

      {/* Step Info */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Step {current} of {total}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-2">{description}</p>
        )}
      </div>
    </div>
  );
}

interface OnboardingLayoutProps {
  children: ReactNode;
  step: number;
  totalSteps: number;
  title: string;
  description?: string;
  showBenefits?: boolean;
}

/**
 * Layout wrapper for onboarding pages with guidance
 */
export function OnboardingLayout({
  children,
  step,
  totalSteps,
  title,
  description,
  showBenefits = true,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-12 lg:py-16 flex flex-col justify-center">
        <JourneyStep
          current={step}
          total={totalSteps}
          title={title}
          description={description}
        />

        <div className="mt-8">{children}</div>
      </div>

      {/* Right Side - Benefits/Visual (Hidden on Mobile) */}
      {showBenefits && (
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary/10 via-accent/5 to-background relative overflow-hidden items-center justify-center p-8">
          {/* Floating Elements */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative space-y-8 max-w-sm">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <span className="text-xl">✨</span>
              </div>
              <h3 className="text-lg font-semibold">Smart Organization</h3>
              <p className="text-sm text-muted-foreground">
                Keep all your applications in one place with our intuitive
                kanban board.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Track every stage of your job search journey visually.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <span className="text-xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold">Get Hired Faster</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered nudges help you follow up at the right time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
