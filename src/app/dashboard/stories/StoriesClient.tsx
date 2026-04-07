"use client";

import { useState } from "react";
import type { StoryBankEntry } from "@prisma/client";
import { StoryCard } from "@/components/stories/StoryCard";
import { StoryForm } from "@/components/stories/StoryForm";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Search,
  X,
  Lightbulb,
} from "lucide-react";

interface StoriesClientProps {
  initialStories: StoryBankEntry[];
}

export function StoriesClient({ initialStories }: StoriesClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StoryBankEntry | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Collect all unique tags
  const allTags = Array.from(
    new Set(initialStories.flatMap((s) => s.tags))
  ).sort();

  // Filter stories
  const filtered = initialStories.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.situation.toLowerCase().includes(q) ||
      s.action.toLowerCase().includes(q) ||
      s.result.toLowerCase().includes(q) ||
      s.tags.some((t) => t.includes(q));
    const matchesTag = !selectedTag || s.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  function handleClose() {
    setShowForm(false);
    setEditing(null);
    router.refresh(); // re-fetch server data after mutation
  }

  function handleEdit(story: StoryBankEntry) {
    setEditing(story);
    setShowForm(true);
  }

  const isOpen = showForm || editing !== null;

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50 flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-teal-500" />
            Story Bank
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">
            {initialStories.length === 0
              ? "Build your STAR+R interview story library."
              : `${initialStories.length} stor${initialStories.length !== 1 ? "ies" : "y"} — ready for any interview.`}
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold shadow-sm shadow-teal-500/25 transition-all hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          New Story
        </button>
      </div>

      {/* ── Tip callout ─────────────────────────────────────────────────────── */}
      {initialStories.length === 0 && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/60">
          <Lightbulb className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
          <div className="text-sm text-teal-800 dark:text-teal-200">
            <strong>STAR+R:</strong> Situation → Task → Action → Result → Reflection.
            {" "}Capture 10–15 strong stories and you'll be ready for any behavioral interview.
          </div>
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      {initialStories.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition"
              placeholder="Search stories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Tag filter chips */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    selectedTag === tag
                      ? "bg-teal-500 border-teal-500 text-white"
                      : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-teal-400"
                  }`}
                >
                  {tag}
                </button>
              ))}
              {selectedTag && (
                <button onClick={() => setSelectedTag(null)} className="text-xs text-stone-400 hover:text-stone-600">
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Story list ──────────────────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((story) => (
            <StoryCard key={story.id} story={story} onEdit={handleEdit} />
          ))}
        </div>
      ) : initialStories.length > 0 ? (
        <div className="text-center py-16 text-stone-400">
          No stories match your filter.
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="h-14 w-14 rounded-2xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-7 w-7 text-teal-400" />
          </div>
          <p className="text-stone-500 text-sm mb-4">No stories yet.</p>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition"
          >
            <Plus className="h-4 w-4" />
            Add your first story
          </button>
        </div>
      )}

      {/* ── Slide-over form ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          {/* Panel */}
          <div className="w-full max-w-xl bg-white dark:bg-stone-900 flex flex-col shadow-2xl overflow-hidden">
            <StoryForm
              existing={editing ?? undefined}
              onClose={handleClose}
            />
          </div>
        </div>
      )}
    </>
  );
}
