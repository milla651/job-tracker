import { z } from "zod";

/**
 * Evaluation prompt — adapted from career-ops/modes/oferta.md
 * Produces a 6-block structured report (A–F) for any job description.
 */

export const EVALUATE_JOB_PROMPT_VERSION = 1;

export function buildEvaluateJobPrompt(params: {
  company: string;
  position: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  description: string;
}): string {
  const salaryInfo =
    params.salaryMin && params.salaryMax
      ? `Salary range: $${params.salaryMin.toLocaleString()}–$${params.salaryMax.toLocaleString()}`
      : "Salary range: Not specified";

  return `Evaluate this job opportunity for the candidate in your system prompt.
Produce a structured 6-block report. Return valid JSON only.

JOB TO EVALUATE:
Company: ${params.company}
Role: ${params.position}
Location: ${params.location ?? "Not specified"}
${salaryInfo}

Job Description:
---
${params.description}
---

Return this exact JSON structure:

{
  "score": "A" | "B" | "C" | "D" | "F",
  "scoreNumeric": 1.0 | 0.8 | 0.6 | 0.4 | 0.2,
  "summary": "<one sentence verdict — direct and specific>",
  "archetype": "<detected role archetype>",
  "cvMatchPercent": <0-100>,
  "keyStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "keyGaps": ["<gap 1>", "<gap 2>"],
  "compensationSignal": "above" | "at" | "below" | "unknown",
  "compensationNotes": "<brief comp analysis>",

  "blockA": {
    "archetype": "<detected archetype>",
    "domain": "<platform/agentic/LLMOps/ML/enterprise/other>",
    "function": "<build/consult/manage/deploy>",
    "seniority": "<detected level>",
    "remote": "<full/hybrid/onsite>",
    "tldr": "<1 sentence — what this role actually needs>"
  },

  "blockB": {
    "requirementMatches": [
      {
        "requirement": "<exact requirement from JD>",
        "cvEvidence": "<exact line from CV proving this match — or null if no evidence>",
        "match": "strong" | "partial" | "none"
      }
    ],
    "gaps": [
      {
        "gap": "<skill or experience gap>",
        "severity": "blocker" | "concern" | "minor",
        "mitigation": "<specific way to address this in application>"
      }
    ]
  },

  "blockC": {
    "detectedLevel": "<junior/mid/senior/staff/principal>",
    "candidateLevel": "<candidate seniority from profile>",
    "levelStrategy": "<how to position experience for this specific level>",
    "downlevelPlan": "<what to do if offered a lower level>"
  },

  "blockD": {
    "jdSalaryRange": "<stated range or null>",
    "marketRate": "<estimated market rate for this role/level/location>",
    "signal": "above" | "at" | "below" | "unknown",
    "notes": "<brief comp analysis, data sources if available>"
  },

  "blockE": {
    "cvChanges": [
      {
        "section": "<which CV section>",
        "current": "<what it says now>",
        "proposed": "<what to change it to>",
        "reason": "<why this change improves match>"
      }
    ],
    "topTalkingPoints": ["<point 1>", "<point 2>", "<point 3>"]
  },

  "blockF": {
    "stories": [
      {
        "jdRequirement": "<requirement this story addresses>",
        "storyTitle": "<short title for this story>",
        "situation": "<context>",
        "task": "<what needed to be done>",
        "action": "<what candidate did>",
        "result": "<outcome with metric if possible>",
        "reflection": "<what was learned — shows seniority>"
      }
    ],
    "redFlagQuestions": [
      {
        "question": "<potential tough question>",
        "strategy": "<how to handle it>"
      }
    ]
  },

  "keywords": ["<ATS keyword 1>", "<keyword 2>"]
}

SCORING GUIDE:
A (1.0) = Strong match. CV aligns well. Apply actively.
B (0.8) = Good fit with minor gaps. Apply with tailored resume.
C (0.6) = Possible stretch. Apply only if excited about the company.
D (0.4) = Significant gaps. Only apply with very strong motivation.
F (0.2) = Not aligned. Save your time.`;
}

// ── Output validation schema ─────────────────────────────────────────────────

const RequirementMatchSchema = z.object({
  requirement: z.string(),
  cvEvidence: z.string().nullable(),
  match: z.enum(["strong", "partial", "none"]),
});

const GapSchema = z.object({
  gap: z.string(),
  severity: z.enum(["blocker", "concern", "minor"]),
  mitigation: z.string(),
});

const StorySchema = z.object({
  jdRequirement: z.string(),
  storyTitle: z.string(),
  situation: z.string(),
  task: z.string(),
  action: z.string(),
  result: z.string(),
  reflection: z.string(),
});

export const EvaluationResultSchema = z.object({
  score: z.enum(["A", "B", "C", "D", "F"]),
  scoreNumeric: z.number().min(0).max(1),
  summary: z.string(),
  archetype: z.string(),
  cvMatchPercent: z.number().int().min(0).max(100),
  keyStrengths: z.array(z.string()),
  keyGaps: z.array(z.string()),
  compensationSignal: z.enum(["above", "at", "below", "unknown"]),
  compensationNotes: z.string(),
  blockA: z.object({
    archetype: z.string(),
    domain: z.string(),
    function: z.string(),
    seniority: z.string(),
    remote: z.string(),
    tldr: z.string(),
  }),
  blockB: z.object({
    requirementMatches: z.array(RequirementMatchSchema),
    gaps: z.array(GapSchema),
  }),
  blockC: z.object({
    detectedLevel: z.string(),
    candidateLevel: z.string(),
    levelStrategy: z.string(),
    downlevelPlan: z.string(),
  }),
  blockD: z.object({
    jdSalaryRange: z.string().nullable(),
    marketRate: z.string(),
    signal: z.enum(["above", "at", "below", "unknown"]),
    notes: z.string(),
  }),
  blockE: z.object({
    cvChanges: z.array(
      z.object({
        section: z.string(),
        current: z.string(),
        proposed: z.string(),
        reason: z.string(),
      })
    ),
    topTalkingPoints: z.array(z.string()),
  }),
  blockF: z.object({
    stories: z.array(StorySchema),
    redFlagQuestions: z.array(
      z.object({
        question: z.string(),
        strategy: z.string(),
      })
    ),
  }),
  keywords: z.array(z.string()),
});

export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;
