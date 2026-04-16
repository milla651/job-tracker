"use client";

import { useState } from "react";
import type { StoryBankEntry } from "@/lib/db-types";
import { deleteStory } from "@/app/actions/stories";
import { Pencil, Trash2, ChevronDown, ChevronUp, Zap } from "lucide-react";

interface StoryCardProps {
  story: StoryBankEntry;
  onEdit: (story: StoryBankEntry) => void;
}

export function StoryCard({ story, onEdit }: StoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${story.title}"?`)) return;
    setDeleting(true);
    await deleteStory(story.id);
    // revalidation happens server-side
  }

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden transition-shadow hover:shadow-sm">
      {/* Header */}
      <div
        className="flex items-start gap-3 px-5 py-4 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-800 dark:text-stone-100 text-sm leading-snug">
            {story.title}
          </h3>

          {/* Tags */}
          {story.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {story.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200/60 dark:border-teal-800/60 text-teal-700 dark:text-teal-400 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Impact callout */}
          {story.impact && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 text-xs font-medium">
              <Zap className="h-3 w-3" />
              {story.impact}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(story); }}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            disabled={deleting}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-stone-400 hover:text-red-500 transition disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button className="p-1.5 text-stone-400">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* STAR details (expanded) */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-stone-100 dark:border-stone-800 pt-4">
          {(
            [
              { key: "situation",  label: "S — Situation" },
              { key: "task",       label: "T — Task" },
              { key: "action",     label: "A — Action" },
              { key: "result",     label: "R — Result" },
              { key: "reflection", label: "+ Reflection" },
            ] as const
          ).map(({ key, label }) => {
            const val = story[key];
            if (!val) return null;
            return (
              <div key={key}>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                  {label}
                </p>
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  {val}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
