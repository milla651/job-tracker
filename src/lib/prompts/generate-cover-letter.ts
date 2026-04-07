/**
 * Cover letter generation prompt.
 * Uses the evaluation report's personalization plan for high-quality output.
 */

export const COVER_LETTER_PROMPT_VERSION = 1;

export function buildCoverLetterPrompt(params: {
  company: string;
  position: string;
  description: string;
  evaluationSummary?: string;
  topTalkingPoints?: string[];
  recruiterName?: string;
}): string {
  const salutation = params.recruiterName
    ? `Dear ${params.recruiterName},`
    : "Dear Hiring Team,";

  const talkingPoints =
    params.topTalkingPoints && params.topTalkingPoints.length > 0
      ? `\nKey points to weave in (from AI evaluation):\n${params.topTalkingPoints.map((p) => `- ${p}`).join("\n")}`
      : "";

  return `Write a cover letter for this job application.

TARGET ROLE:
Company: ${params.company}
Position: ${params.position}
Salutation: ${salutation}
${params.evaluationSummary ? `Why this role is a fit: ${params.evaluationSummary}` : ""}
${talkingPoints}

Job Description:
---
${params.description}
---

RULES:
1. Max 4 paragraphs. Max 350 words. No fluff.
2. Paragraph 1: Why THIS company + THIS role specifically (not generic).
3. Paragraph 2: The strongest proof point from the CV that maps to the core JD need.
4. Paragraph 3: A second proof point OR how their background maps to a specific challenge.
5. Paragraph 4: Short close. Confident, not desperate.
6. Never start with "I am excited to..." or "I am writing to apply..."
7. Quote 1-2 specific phrases from the JD to show you read it.
8. Use active voice. Action verbs. Metrics where possible.
9. Sound like a senior professional, not a job seeker.

Return plain text (no JSON). Start directly with the salutation.`;
}
