"use client";

import { useState, useTransition } from "react";
import type { InterviewPrepPackage, StoryBankEntry } from "@/lib/db-types";
import {
  generatePrepPackage,
  savePrepNotes,
} from "@/app/actions/interview-prep";
import {
  Sparkles,
  Loader2,
  Building2,
  MessageSquare,
  Code2,
  Users,
  Lightbulb,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  StickyNote,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Question {
  question: string;
  whyAsked: string;
  difficulty: 1 | 2 | 3;
}

interface PredictedQuestions {
  behavioral?: Question[];
  technical?: Question[];
  roleSpecific?: Question[];
  culture?: Question[];
}

interface SuggestedStory {
  questionIndex: number;
  questionType: string;
  storyId: string;
  storyTitle: string;
  matchReason: string;
}

interface JobInfo {
  id: string;
  company: string;
  position: string;
  description: string | null;
  status: string;
}

interface PrepPageClientProps {
  job: JobInfo;
  initialPrepPackage: InterviewPrepPackage | null;
  stories: StoryBankEntry[];
}

// ── Difficulty Badge ──────────────────────────────────────────────────────────

function DiffBadge({ level }: { level: 1 | 2 | 3 }) {
  const map = {
    1: { label: "Easy", cls: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200/60 dark:border-green-800/60" },
    2: { label: "Medium", cls: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60" },
    3: { label: "Hard", cls: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200/60 dark:border-red-800/60" },
  };
  const { label, cls } = map[level];
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
}

// ── Question Card ─────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  idx,
  matchedStory,
}: {
  question: Question;
  idx: number;
  matchedStory?: StoryBankEntry;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="shrink-0 h-6 w-6 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 text-xs font-bold flex items-center justify-center mt-0.5">
          {idx + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-800 dark:text-stone-100 leading-snug">
            {question.question}
          </p>
          {matchedStory && (
            <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Use: {matchedStory.title}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <DiffBadge level={question.difficulty} />
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-stone-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-stone-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-stone-100 dark:border-stone-800 pt-3 space-y-3">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
              Why they ask this
            </p>
            <p className="text-sm text-stone-600 dark:text-stone-400">{question.whyAsked}</p>
          </div>
          {matchedStory && (
            <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/60">
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-0.5">
                Suggested STAR story
              </p>
              <p className="text-sm text-teal-800 dark:text-teal-200">{matchedStory.title}</p>
              {matchedStory.impact && (
                <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">{matchedStory.impact}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Question Section ──────────────────────────────────────────────────────────

function QuestionSection({
  title,
  icon: Icon,
  questions,
  storyMap,
}: {
  title: string;
  icon: React.ElementType;
  questions: Question[];
  storyMap: Map<number, StoryBankEntry>;
}) {
  if (!questions.length) return null;

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <Icon className="h-4 w-4 text-teal-500" />
        <h3 className="font-semibold text-stone-800 dark:text-stone-100 text-sm">{title}</h3>
        <span className="ml-auto text-xs text-stone-400">{questions.length} questions</span>
      </div>
      <div className="p-4 space-y-2">
        {questions.map((q, i) => (
          <QuestionCard
            key={i}
            question={q}
            idx={i}
            matchedStory={storyMap.get(i)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PrepPageClient({ job, initialPrepPackage, stories }: PrepPageClientProps) {
  const [prepPackage, setPrepPackage] = useState(initialPrepPackage);
  const [notes, setNotes] = useState(initialPrepPackage?.prepNotes ?? "");
  const [notesSaved, setNotesSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [savingNotes, setSavingNotes] = useState(false);

  const questions = prepPackage?.predictedQuestions as PredictedQuestions | null;
  const suggestedStories = (prepPackage?.suggestedStories ?? []) as unknown as SuggestedStory[];

  // Build story lookup for behavioral questions
  const behavioralStoryMap = new Map<number, StoryBankEntry>();
  suggestedStories.forEach((s) => {
    if (s.questionType === "behavioral") {
      const story = stories.find((st) => st.id === s.storyId);
      if (story) behavioralStoryMap.set(s.questionIndex, story);
    }
  });

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const res = await generatePrepPackage(job.id);
      if (res.success) {
        setPrepPackage(res.package);
        setNotes(res.package.prepNotes ?? "");
      } else {
        setError(res.error);
      }
    });
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    const res = await savePrepNotes(job.id, notes);
    setSavingNotes(false);
    if (res.success) {
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-50">
            Interview Prep
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">
            {job.position} at {job.company}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white text-sm font-semibold shadow-sm shadow-teal-500/25 transition-all hover:shadow-md"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {prepPackage ? "Regenerate" : "Generate Prep Package"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/60">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {isPending && (
        <div className="space-y-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!prepPackage && !isPending && (
        <div className="text-center py-16">
          <div className="h-16 w-16 rounded-2xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-teal-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-800 dark:text-stone-100 mb-2">
            No prep package yet
          </h3>
          <p className="text-sm text-stone-500 mb-6 max-w-sm mx-auto">
            AI will predict interview questions, match your STAR stories, and summarize company research.
          </p>
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition"
          >
            <Sparkles className="h-4 w-4" />
            Generate prep package
          </button>
        </div>
      )}

      {/* Content */}
      {prepPackage && !isPending && questions && (
        <div className="space-y-5">
          {/* Company research summary */}
          {prepPackage.companyResearch && Object.keys(prepPackage.companyResearch as object).length > 0 && (
            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-stone-100 dark:border-stone-800">
                <Building2 className="h-4 w-4 text-teal-500" />
                <h3 className="font-semibold text-stone-800 dark:text-stone-100 text-sm">Company Research</h3>
              </div>
              <div className="p-5 grid sm:grid-cols-2 gap-4">
                {Object.entries(prepPackage.companyResearch as Record<string, string>).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="text-sm text-stone-700 dark:text-stone-300">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions by type */}
          <QuestionSection
            title="Behavioral Questions"
            icon={MessageSquare}
            questions={questions.behavioral ?? []}
            storyMap={behavioralStoryMap}
          />
          <QuestionSection
            title="Technical Questions"
            icon={Code2}
            questions={questions.technical ?? []}
            storyMap={new Map()}
          />
          <QuestionSection
            title="Role-Specific Questions"
            icon={Lightbulb}
            questions={questions.roleSpecific ?? []}
            storyMap={new Map()}
          />
          <QuestionSection
            title="Culture & Values"
            icon={Users}
            questions={questions.culture ?? []}
            storyMap={new Map()}
          />

          {/* Personal notes */}
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-stone-100 dark:border-stone-800">
              <StickyNote className="h-4 w-4 text-teal-500" />
              <h3 className="font-semibold text-stone-800 dark:text-stone-100 text-sm">Personal Notes</h3>
            </div>
            <div className="p-5">
              <textarea
                className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-2.5 text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 transition resize-none"
                rows={6}
                placeholder="Add your personal notes, things to research, questions to ask them…"
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }}
              />
              <div className="flex items-center justify-end gap-3 mt-3">
                {notesSaved && (
                  <span className="text-xs text-teal-600 dark:text-teal-400">Saved.</span>
                )}
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-4 py-2 rounded-xl bg-stone-800 dark:bg-stone-100 hover:bg-stone-900 dark:hover:bg-white disabled:opacity-60 text-white dark:text-stone-900 text-sm font-semibold transition"
                >
                  {savingNotes ? "Saving…" : "Save Notes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
