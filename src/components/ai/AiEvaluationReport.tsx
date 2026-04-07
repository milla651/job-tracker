"use client";

import { useState, useTransition } from "react";
import type { AiEvaluation } from "@prisma/client";
import { AiScoreBadge } from "./AiScoreBadge";
import { refreshEvaluation } from "@/app/actions/ai-evaluation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCw, TrendingUp, AlertTriangle, CheckCircle, DollarSign, FileText, MessageSquare } from "lucide-react";
import type { EvaluationResult } from "@/lib/prompts/evaluate-job";

interface AiEvaluationReportProps {
  jobApplicationId: string;
  evaluation: AiEvaluation | null;
  /** If true the evaluation is running in background */
  isPending?: boolean;
}

export function AiEvaluationReport({
  jobApplicationId,
  evaluation,
  isPending = false,
}: AiEvaluationReportProps) {
  const [isRefreshing, startRefresh] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = () => {
    setError(null);
    startRefresh(async () => {
      const result = await refreshEvaluation(jobApplicationId);
      if (!result.success) setError(result.error);
    });
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isPending || (!evaluation && !error)) {
    return (
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded border border-stone-200 dark:border-stone-700 animate-pulse bg-stone-200 dark:bg-stone-700" />
          <div>
            <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
              AI Evaluation in Progress
            </p>
            <p className="text-xs text-stone-500">
              Analyzing job fit against your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── No description ────────────────────────────────────────────────────────
  if (!evaluation) {
    return (
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 p-6 text-center">
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
          {error ?? "Add a job description to get an AI evaluation."}
        </p>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RotateCw className={`mr-2 h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Evaluate Now
        </Button>
      </div>
    );
  }

  const report = evaluation.fullReport as unknown as EvaluationResult;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <AiScoreBadge score={evaluation.score} size="md" />
          <div>
            <p className="text-sm font-medium text-stone-800 dark:text-stone-100">
              {evaluation.summary}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Evaluated with {evaluation.modelUsed} · {new Date(evaluation.generatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="shrink-0"
        >
          <RotateCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="sr-only">Re-evaluate</span>
        </Button>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-3 text-center">
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            {evaluation.cvMatchPercent ?? "—"}
            {evaluation.cvMatchPercent != null && "%"}
          </p>
          <p className="text-xs text-stone-500 mt-0.5">CV Match</p>
        </div>
        <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-3 text-center">
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            {evaluation.keyStrengths.length}
          </p>
          <p className="text-xs text-stone-500 mt-0.5">Strengths</p>
        </div>
        <div className="rounded-lg border border-stone-200 dark:border-stone-800 p-3 text-center">
          <p className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            {evaluation.keyGaps.length}
          </p>
          <p className="text-xs text-stone-500 mt-0.5">Gaps</p>
        </div>
      </div>

      {/* Strengths & Gaps */}
      {(evaluation.keyStrengths.length > 0 || evaluation.keyGaps.length > 0) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {evaluation.keyStrengths.length > 0 && (
            <div className="rounded-lg border border-teal-200/50 dark:border-teal-800/50 bg-teal-50/50 dark:bg-teal-950/30 p-3">
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-2 flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" /> Strengths
              </p>
              <ul className="space-y-1">
                {evaluation.keyStrengths.map((s, i) => (
                  <li key={i} className="text-xs text-stone-700 dark:text-stone-300">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {evaluation.keyGaps.length > 0 && (
            <div className="rounded-lg border border-orange-200/50 dark:border-orange-800/50 bg-orange-50/50 dark:bg-orange-950/30 p-3">
              <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Gaps
              </p>
              <ul className="space-y-1">
                {evaluation.keyGaps.map((g, i) => (
                  <li key={i} className="text-xs text-stone-700 dark:text-stone-300">
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Detailed blocks */}
      <Accordion type="multiple" className="space-y-2">
        {/* Block B — CV Match */}
        {report?.blockB && (
          <AccordionItem value="cv-match" className="rounded-lg border border-stone-200 dark:border-stone-800 px-4">
            <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal-500" />
                CV Match Analysis
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-2">
                {report.blockB.requirementMatches.map((match, i) => (
                  <div key={i} className="flex gap-2">
                    <span className={`mt-0.5 shrink-0 text-xs font-bold ${
                      match.match === "strong" ? "text-teal-500" :
                      match.match === "partial" ? "text-yellow-500" : "text-red-500"
                    }`}>
                      {match.match === "strong" ? "✓" : match.match === "partial" ? "~" : "✗"}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-stone-700 dark:text-stone-300">
                        {match.requirement}
                      </p>
                      {match.cvEvidence && (
                        <p className="text-xs text-stone-500 italic mt-0.5">
                          "{match.cvEvidence}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Block D — Compensation */}
        {report?.blockD && (
          <AccordionItem value="comp" className="rounded-lg border border-stone-200 dark:border-stone-800 px-4">
            <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                Compensation Analysis
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-stone-500">JD Range</p>
                  <p className="font-medium text-stone-800 dark:text-stone-100">
                    {report.blockD.jdSalaryRange ?? "Not stated"}
                  </p>
                </div>
                <div>
                  <p className="text-stone-500">Market Rate</p>
                  <p className="font-medium text-stone-800 dark:text-stone-100">
                    {report.blockD.marketRate}
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {report.blockD.notes}
              </p>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Block E — Personalization */}
        {report?.blockE && report.blockE.cvChanges.length > 0 && (
          <AccordionItem value="personalization" className="rounded-lg border border-stone-200 dark:border-stone-800 px-4">
            <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                Personalization Plan
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {report.blockE.cvChanges.map((change, i) => (
                <div key={i} className="border-l-2 border-blue-300 dark:border-blue-700 pl-3">
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {change.section}
                  </p>
                  <p className="text-xs text-stone-500 line-through mt-0.5">{change.current}</p>
                  <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">→ {change.proposed}</p>
                  <p className="text-xs text-stone-400 mt-0.5 italic">{change.reason}</p>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Block F — Interview Stories */}
        {report?.blockF && report.blockF.stories.length > 0 && (
          <AccordionItem value="stories" className="rounded-lg border border-stone-200 dark:border-stone-800 px-4">
            <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-500" />
                Interview Stories ({report.blockF.stories.length})
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              {report.blockF.stories.map((story, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {story.storyTitle}
                  </p>
                  <p className="text-xs text-stone-500">For: "{story.jdRequirement}"</p>
                  <div className="space-y-0.5 pl-2 border-l-2 border-purple-200 dark:border-purple-800">
                    {[
                      { label: "S", text: story.situation },
                      { label: "T", text: story.task },
                      { label: "A", text: story.action },
                      { label: "R", text: story.result },
                      { label: "+R", text: story.reflection },
                    ].map(({ label, text }) => (
                      <p key={label} className="text-xs text-stone-600 dark:text-stone-400">
                        <span className="font-bold text-purple-600 dark:text-purple-400 mr-1">{label}</span>
                        {text}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      {/* ATS Keywords */}
      {report?.keywords && report.keywords.length > 0 && (
        <div>
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2">
            ATS Keywords to include
          </p>
          <div className="flex flex-wrap gap-1.5">
            {report.keywords.map((kw, i) => (
              <Badge key={i} variant="secondary" className="text-xs font-normal">
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
