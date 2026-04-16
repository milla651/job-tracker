"use client";

import { useState } from "react";
import { createStory, updateStory, type StoryFormData } from "@/app/actions/stories";
import type { StoryBankEntry } from "@/lib/db-types";
import { X, Plus, Loader2 } from "lucide-react";

// ── Common labels ─────────────────────────────────────────────────────────────

const COMMON_TAGS = [
  "leadership", "technical", "cross-functional", "problem-solving",
  "communication", "mentorship", "architecture", "delivery", "conflict",
  "data-driven", "stakeholder", "process-improvement",
];

const FIELD_HINTS = {
  situation: "Set the scene. What was the context or background?",
  task:      "What were you responsible for? What was your goal or challenge?",
  action:    "What specific steps did YOU take? Use first-person.",
  result:    "What happened as a result? Quantify where possible.",
  reflection:"What did you learn? How would you do it differently?",
};

// ── Component ─────────────────────────────────────────────────────────────────

interface StoryFormProps {
  existing?: StoryBankEntry;
  onClose: () => void;
}

export function StoryForm({ existing, onClose }: StoryFormProps) {
  const [form, setForm] = useState<StoryFormData>({
    title:      existing?.title      ?? "",
    situation:  existing?.situation  ?? "",
    task:       existing?.task       ?? "",
    action:     existing?.action     ?? "",
    result:     existing?.result     ?? "",
    reflection: existing?.reflection ?? "",
    impact:     existing?.impact     ?? "",
    tags:       existing?.tags       ?? [],
  });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof StoryFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addTag(tag: string) {
    const clean = tag.trim().toLowerCase().replace(/\s+/g, "-");
    if (!clean || (form.tags ?? []).includes(clean) || (form.tags?.length ?? 0) >= 10) return;
    setForm((prev) => ({ ...prev, tags: [...(prev.tags ?? []), clean] }));
    setTagInput("");
  }

  function removeTag(tag: string) {
    setForm((prev) => ({ ...prev, tags: (prev.tags ?? []).filter((t) => t !== tag) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = existing
      ? await updateStory(existing.id, form)
      : await createStory(form);

    setSaving(false);
    if (!res.success) {
      setError(res.error ?? "Something went wrong");
    } else {
      onClose();
    }
  }

  const textAreaClass =
    "w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2.5 text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 transition resize-none";
  const inputClass =
    "w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-3 py-2.5 text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 transition";
  const labelClass = "block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wide mb-1";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-stone-200 dark:border-stone-800 shrink-0">
        <h2 className="font-semibold text-stone-900 dark:text-stone-50 text-lg">
          {existing ? "Edit Story" : "New STAR Story"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1 p-5 space-y-5">

        {/* Title */}
        <div>
          <label className={labelClass}>Story Title</label>
          <input
            className={inputClass}
            placeholder="e.g. Led migration to microservices, cutting deploy time 40%"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
          />
        </div>

        {/* STAR fields */}
        {(["situation", "task", "action", "result"] as const).map((field) => (
          <div key={field}>
            <label className={labelClass}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
            <p className="text-xs text-stone-400 mb-1.5">{FIELD_HINTS[field]}</p>
            <textarea
              className={textAreaClass}
              rows={3}
              placeholder={FIELD_HINTS[field]}
              value={form[field] as string}
              onChange={(e) => set(field, e.target.value)}
              required
            />
          </div>
        ))}

        {/* Reflection (optional) */}
        <div>
          <label className={labelClass}>
            Reflection <span className="text-stone-400 font-normal normal-case">(optional)</span>
          </label>
          <p className="text-xs text-stone-400 mb-1.5">{FIELD_HINTS.reflection}</p>
          <textarea
            className={textAreaClass}
            rows={2}
            placeholder="What did you learn from this experience?"
            value={form.reflection ?? ""}
            onChange={(e) => set("reflection", e.target.value)}
          />
        </div>

        {/* Impact */}
        <div>
          <label className={labelClass}>
            Quantified Impact <span className="text-stone-400 font-normal normal-case">(optional)</span>
          </label>
          <input
            className={inputClass}
            placeholder="e.g. Reduced deploy time 40%, saved $200K/year"
            value={form.impact ?? ""}
            onChange={(e) => set("impact", e.target.value)}
          />
        </div>

        {/* Tags */}
        <div>
          <label className={labelClass}>Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(form.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-medium"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className={inputClass}
              placeholder="Add a tag…"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); }
              }}
            />
            <button
              type="button"
              onClick={() => addTag(tagInput)}
              className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-sm transition shrink-0"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {/* Suggestions */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {COMMON_TAGS.filter((t) => !(form.tags ?? []).includes(t)).slice(0, 8).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="px-2 py-1 rounded-full border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-xs hover:border-teal-400 hover:text-teal-600 transition"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-stone-200 dark:border-stone-800 shrink-0 flex items-center justify-between gap-3">
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3 ml-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white text-sm font-semibold transition"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {existing ? "Save Changes" : "Add Story"}
          </button>
        </div>
      </div>
    </form>
  );
}
