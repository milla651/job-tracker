"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate, formatSalary } from "@/lib/utils";
import { AiEvaluationReport } from "@/components/ai/AiEvaluationReport";
import { AiToolsPanel } from "@/components/ai/AiToolsPanel";
import { PrepPageClient } from "@/app/dashboard/jobs/[id]/prep/PrepPageClient";
import { Timeline } from "@/components/Timeline";
import {
  MapPin, DollarSign, Calendar, ExternalLink,
  FileText, Sparkles, ClipboardList, Clock,
  CheckCircle2, Circle, ChevronRight,
} from "lucide-react";
import type { AiEvaluation, JobApplication, InterviewPrepPackage, StoryBankEntry } from "@prisma/client";
import type { TimelineEvent } from "@prisma/client";

interface JobDetailTabsProps {
  job: JobApplication & {
    aiEvaluation: AiEvaluation | null;
    timeline: TimelineEvent[];
  };
  prepPackage: InterviewPrepPackage | null;
  stories: StoryBankEntry[];
}

type Tab = "overview" | "ai-match" | "prep" | "timeline";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "overview",  label: "Overview",       icon: FileText      },
  { id: "ai-match",  label: "AI Match",        icon: Sparkles      },
  { id: "prep",      label: "Interview Prep",  icon: ClipboardList },
  { id: "timeline",  label: "Timeline",        icon: Clock         },
];

export function JobDetailTabs({ job, prepPackage, stories }: JobDetailTabsProps) {
  const [active, setActive] = useState<Tab>("overview");

  const hasPrepPackage = prepPackage !== null;
  const hasEval = job.aiEvaluation !== null;

  return (
    <div>
      {/* ── Tab bar ───────────────────────────────────────────────────── */}
      <div className="border-b border-stone-200 dark:border-stone-800 mb-6">
        <div className="flex gap-1 -mb-px overflow-x-auto no-scrollbar">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            const hasBadge =
              (id === "ai-match" && hasEval) ||
              (id === "prep" && hasPrepPackage) ||
              (id === "timeline" && job.timeline.length > 0);

            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap shrink-0
                  ${isActive
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:border-stone-300"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {label}
                {hasBadge && !isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Overview tab ──────────────────────────────────────────────── */}
      {active === "overview" && (
        <div className="space-y-6">
          {/* Key facts */}
          <div className="grid sm:grid-cols-2 gap-3">
            {job.location && (
              <FactCard icon={MapPin} label="Location" value={job.location} />
            )}
            {(job.salaryMin || job.salaryMax) && (
              <FactCard icon={DollarSign} label="Salary" value={formatSalary(job.salaryMin, job.salaryMax) ?? "Not specified"} />
            )}
            <FactCard icon={Calendar} label="Applied" value={formatDate(job.appliedAt)} />
            {job.jobUrl && (
              <a href={job.jobUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors group">
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                  <ExternalLink className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <p className="text-xs text-indigo-400 font-medium">Job Posting</p>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">View original →</p>
                </div>
              </a>
            )}
          </div>

          {/* Offer details (unlocks negotiation) */}
          {(job.status === "OFFER" || job.status === "ACCEPTED" || job.offerBase) && (
            <OfferSection job={job} />
          )}

          {/* Job description */}
          {job.description && (
            <CollapsibleText
              label="Job Description"
              text={job.description}
              previewLines={6}
            />
          )}

          {/* Personal notes */}
          <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20 p-4">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">Your Notes</p>
            {job.notes ? (
              <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
                {job.notes}
              </p>
            ) : (
              <Link href={`/dashboard/jobs/${job.id}/edit`}
                className="text-sm text-amber-500 hover:underline">
                Add personal notes →
              </Link>
            )}
          </div>

          {/* AI document tools */}
          <AiToolsPanel jobApplicationId={job.id} hasOffer={!!job.offerBase} />

          {/* CTA to AI Match */}
          {!hasEval && (
            <button onClick={() => setActive("ai-match")}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors group">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5" />
                <div className="text-left">
                  <p className="text-sm font-semibold">Get AI job match score</p>
                  <p className="text-xs opacity-70">See CV match %, strengths, gaps, and tailoring plan</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {/* CTA to Prep */}
          {!hasPrepPackage && (job.status === "PHONE_SCREEN" || job.status === "INTERVIEW" || job.status === "TECHNICAL") && (
            <button onClick={() => setActive("prep")}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-dashed border-teal-300 dark:border-teal-800 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors group">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5" />
                <div className="text-left">
                  <p className="text-sm font-semibold">Generate interview prep</p>
                  <p className="text-xs opacity-70">Predicted questions, STAR story matches & company research</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      )}

      {/* ── AI Match tab ──────────────────────────────────────────────── */}
      {active === "ai-match" && (
        <div className="space-y-4">
          {!hasEval && (
            <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 mb-2">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">What you'll get</p>
                  <ul className="mt-2 space-y-1.5">
                    {[
                      "CV match % against job requirements",
                      "Top strengths and skill gaps",
                      "Tailored CV rewrite suggestions",
                      "ATS keywords to include",
                      "Salary signal vs your target",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          <AiEvaluationReport
            jobApplicationId={job.id}
            evaluation={job.aiEvaluation}
            isPending={false}
          />
          {hasEval && (
            <div className="flex items-center gap-3 pt-2">
              <button onClick={() => setActive("overview")}
                className="text-xs text-stone-500 hover:text-indigo-500 transition-colors flex items-center gap-1">
                <ChevronRight className="h-3 w-3 rotate-180" />
                Back to overview
              </button>
              <button onClick={() => setActive("prep")}
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 ml-auto">
                Go to interview prep <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Interview Prep tab ────────────────────────────────────────── */}
      {active === "prep" && (
        <PrepPageClient
          job={{ id: job.id, company: job.company, position: job.position, description: job.description, status: job.status }}
          initialPrepPackage={prepPackage}
          stories={stories}
        />
      )}

      {/* ── Timeline tab ──────────────────────────────────────────────── */}
      {active === "timeline" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {job.timeline.length} event{job.timeline.length !== 1 ? "s" : ""} recorded
            </p>
          </div>
          {job.timeline.length > 0 ? (
            <Timeline events={job.timeline} />
          ) : (
            <div className="text-center py-12 text-stone-400 dark:text-stone-600">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No events yet — they&apos;ll appear here as you update this application.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Helper components ─────────────────────────────────────────────────────────

function FactCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800">
      <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800">
        <Icon className="h-4 w-4 text-stone-500" />
      </div>
      <div>
        <p className="text-xs text-stone-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">{value}</p>
      </div>
    </div>
  );
}

function CollapsibleText({ label, text, previewLines }: { label: string; text: string; previewLines: number }) {
  const [expanded, setExpanded] = useState(false);
  const lines = text.split("\n");
  const isLong = lines.length > previewLines;
  const preview = isLong && !expanded ? lines.slice(0, previewLines).join("\n") : text;

  return (
    <div>
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 p-4">
        <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
          {preview}
          {isLong && !expanded && "…"}
        </p>
        {isLong && (
          <button onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-xs text-indigo-500 hover:underline font-medium">
            {expanded ? "Show less" : "Read full description"}
          </button>
        )}
      </div>
    </div>
  );
}

function OfferSection({ job }: { job: JobApplication }) {
  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">
        Offer Details
      </p>
      {job.offerBase ? (
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-stone-400 mb-0.5">Base salary</p>
            <p className="font-semibold text-stone-800 dark:text-stone-100">
              ${job.offerBase.toLocaleString()}
            </p>
          </div>
          {job.offerBonus && (
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Bonus</p>
              <p className="font-semibold text-stone-800 dark:text-stone-100">
                ${job.offerBonus.toLocaleString()}
              </p>
            </div>
          )}
          {job.offerEquity && (
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Equity</p>
              <p className="font-semibold text-stone-800 dark:text-stone-100">{job.offerEquity}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <Circle className="h-4 w-4 text-emerald-400" />
          <span>Add offer details to unlock the </span>
          <span className="font-medium text-emerald-700 dark:text-emerald-300">Negotiation Script</span>
          <span> — edit the job to add salary, equity, and bonus.</span>
        </div>
      )}
    </div>
  );
}
