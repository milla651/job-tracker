import { z } from "zod";

/**
 * Resume tailoring prompt — adapted from career-ops/modes/pdf.md
 * Takes the user's base CV + job description → produces ATS-optimized resume content.
 */

export const TAILOR_RESUME_PROMPT_VERSION = 1;

export function buildTailorResumePrompt(params: {
  company: string;
  position: string;
  description: string;
  evaluationSummary?: string;
  topTalkingPoints?: string[];
  keywords?: string[];
}): string {
  const talkingPoints =
    params.topTalkingPoints && params.topTalkingPoints.length > 0
      ? `\nTop talking points from evaluation:\n${params.topTalkingPoints.map((p) => `- ${p}`).join("\n")}`
      : "";

  const keywordsHint =
    params.keywords && params.keywords.length > 0
      ? `\nATS keywords to include: ${params.keywords.join(", ")}`
      : "";

  return `Tailor the candidate's CV from your system prompt for this specific job.

TARGET ROLE:
Company: ${params.company}
Position: ${params.position}
${params.evaluationSummary ? `AI Evaluation: ${params.evaluationSummary}` : ""}
${talkingPoints}
${keywordsHint}

Job Description:
---
${params.description}
---

RULES:
1. Use ONLY experience and skills already in the CV. Never invent anything.
2. Reorder and rephrase bullet points to match the JD language.
3. Lead every bullet with an action verb and a metric where possible.
4. Use exact keywords from the JD for ATS compatibility.
5. Keep the Professional Summary under 4 sentences.
6. Single-column layout content only (the HTML template handles design).
7. Be ruthless: cut irrelevant experience, expand relevant experience.
8. Never use passive voice. Never use "responsible for".

Return this JSON structure:

{
  "professionalSummary": "<4 sentences max — tailored to this specific role>",
  "experience": [
    {
      "company": "<company name>",
      "title": "<job title>",
      "period": "<dates>",
      "location": "<location>",
      "bullets": ["<tailored bullet 1>", "<tailored bullet 2>"]
    }
  ],
  "skills": {
    "primary": ["<skill 1>", "<skill 2>"],
    "secondary": ["<skill 3>", "<skill 4>"]
  },
  "education": [
    {
      "institution": "<school>",
      "degree": "<degree>",
      "period": "<dates>"
    }
  ],
  "projects": [
    {
      "name": "<project name>",
      "description": "<1 sentence>",
      "url": "<url or null>",
      "metric": "<key metric or null>"
    }
  ],
  "tailoringNotes": "<brief explanation of what was changed and why>"
}`;
}

export const TailoredResumeSchema = z.object({
  professionalSummary: z.string(),
  experience: z.array(
    z.object({
      company: z.string(),
      title: z.string(),
      period: z.string(),
      location: z.string().optional(),
      bullets: z.array(z.string()),
    })
  ),
  skills: z.object({
    primary: z.array(z.string()),
    secondary: z.array(z.string()),
  }),
  education: z.array(
    z.object({
      institution: z.string(),
      degree: z.string(),
      period: z.string(),
    })
  ),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        url: z.string().nullable(),
        metric: z.string().nullable(),
      })
    )
    .optional(),
  tailoringNotes: z.string(),
});

export type TailoredResume = z.infer<typeof TailoredResumeSchema>;
