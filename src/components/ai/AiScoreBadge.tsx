"use client";

import { cn } from "@/lib/utils";
import type { AiScore } from "@/lib/db-types";

interface AiScoreBadgeProps {
  score: AiScore | null | undefined;
  /** "pending" = evaluation in progress, "unavailable" = no API key */
  state?: "pending" | "unavailable" | "ready";
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const scoreConfig: Record<
  AiScore,
  { label: string; description: string; classes: string }
> = {
  A: {
    label: "A",
    description: "Strong match — apply actively",
    classes: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
  },
  B: {
    label: "B",
    description: "Good fit — apply with tailored resume",
    classes: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
  },
  C: {
    label: "C",
    description: "Possible stretch — apply if excited",
    classes: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  },
  D: {
    label: "D",
    description: "Significant gaps — apply with caution",
    classes: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  },
  F: {
    label: "F",
    description: "Not aligned — save your time",
    classes: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  },
};

export function AiScoreBadge({
  score,
  state = "ready",
  size = "sm",
  showLabel = false,
  className,
}: AiScoreBadgeProps) {
  const sizeClasses = size === "sm"
    ? "h-6 min-w-6 text-xs px-1.5"
    : "h-8 min-w-8 text-sm px-2";

  if (state === "pending" || (!score && state === "ready")) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded border font-semibold",
          "bg-stone-200/50 dark:bg-stone-700/50 text-stone-400 border-stone-300/50 dark:border-stone-600/50",
          "animate-pulse",
          sizeClasses,
          className
        )}
        title="AI evaluating..."
      >
        <span className="sr-only">AI evaluating</span>
        <span aria-hidden>·</span>
      </span>
    );
  }

  if (state === "unavailable" || !score) {
    return null;
  }

  const config = scoreConfig[score];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded border font-bold tracking-tight",
        config.classes,
        sizeClasses,
        className
      )}
      title={config.description}
      aria-label={`AI score: ${config.label} — ${config.description}`}
    >
      {config.label}
      {showLabel && (
        <span className="ml-1 font-normal opacity-80">{config.description}</span>
      )}
    </span>
  );
}
