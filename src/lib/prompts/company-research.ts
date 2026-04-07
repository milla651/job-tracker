import { z } from "zod";

/**
 * Company deep research prompt — adapted from career-ops/modes/deep.md
 * 6-axis analysis for interview preparation.
 */

export const COMPANY_RESEARCH_PROMPT_VERSION = 1;

export function buildCompanyResearchPrompt(params: {
  company: string;
  position: string;
  jobUrl?: string | null;
}): string {
  return `Research this company for a job interview preparation.

Company: ${params.company}
Role being applied for: ${params.position}
${params.jobUrl ? `Job URL: ${params.jobUrl}` : ""}

Analyze across 6 axes. Return JSON:

{
  "overview": {
    "founded": "<year or unknown>",
    "stage": "<seed/series-a/series-b/public/acquired/unknown>",
    "size": "<headcount or range>",
    "funding": "<total raised or market cap>",
    "mission": "<1 sentence>",
    "products": ["<product 1>", "<product 2>"]
  },
  "aiStrategy": {
    "summary": "<how AI factors into their product/business>",
    "recentMoves": ["<recent AI news or product launch>"],
    "maturity": "early" | "growing" | "mature" | "unknown"
  },
  "engineeringCulture": {
    "signals": ["<culture signal from blog/job posts/news>"],
    "techStack": ["<known technologies>"],
    "workStyle": "<remote/hybrid/onsite and how they work>",
    "engBlogUrl": "<url or null>"
  },
  "businessChallenges": {
    "current": ["<challenge 1>", "<challenge 2>"],
    "opportunities": ["<opportunity 1>"]
  },
  "competitiveLandscape": {
    "mainCompetitors": ["<competitor 1>", "<competitor 2>"],
    "differentiator": "<what makes this company unique>"
  },
  "candidateAngle": {
    "whyThisCompany": "<specific reasons this candidate should care>",
    "questionsToAsk": [
      "<smart question to ask in interview 1>",
      "<smart question to ask in interview 2>",
      "<smart question to ask in interview 3>"
    ],
    "talkingPoints": ["<point to emphasize in the interview>"]
  },
  "dataConfidence": "high" | "medium" | "low",
  "dataNotes": "<any caveats about data freshness or gaps>"
}

Be honest about what you know vs. what you're inferring. Mark low-confidence items.`;
}

export const CompanyResearchSchema = z.object({
  overview: z.object({
    founded: z.string(),
    stage: z.string(),
    size: z.string(),
    funding: z.string(),
    mission: z.string(),
    products: z.array(z.string()),
  }),
  aiStrategy: z.object({
    summary: z.string(),
    recentMoves: z.array(z.string()),
    maturity: z.enum(["early", "growing", "mature", "unknown"]),
  }),
  engineeringCulture: z.object({
    signals: z.array(z.string()),
    techStack: z.array(z.string()),
    workStyle: z.string(),
    engBlogUrl: z.string().nullable(),
  }),
  businessChallenges: z.object({
    current: z.array(z.string()),
    opportunities: z.array(z.string()),
  }),
  competitiveLandscape: z.object({
    mainCompetitors: z.array(z.string()),
    differentiator: z.string(),
  }),
  candidateAngle: z.object({
    whyThisCompany: z.string(),
    questionsToAsk: z.array(z.string()),
    talkingPoints: z.array(z.string()),
  }),
  dataConfidence: z.enum(["high", "medium", "low"]),
  dataNotes: z.string(),
});

export type CompanyResearch = z.infer<typeof CompanyResearchSchema>;
