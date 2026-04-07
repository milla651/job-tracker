import { z } from "zod";

/**
 * Interview question prediction prompt.
 * Generates predicted questions sorted by likelihood and type.
 */

export const PREDICT_QUESTIONS_PROMPT_VERSION = 1;

export function buildPredictQuestionsPrompt(params: {
  company: string;
  position: string;
  description: string;
  companyResearch?: string;
}): string {
  return `Predict the most likely interview questions for this role.

ROLE:
Company: ${params.company}
Position: ${params.position}
${params.companyResearch ? `\nCompany context:\n${params.companyResearch}` : ""}

Job Description:
---
${params.description}
---

Generate 12-18 questions split across types. Return JSON:

{
  "behavioral": [
    {
      "question": "<the question>",
      "whyAsked": "<why this company would ask this>",
      "difficulty": 1 | 2 | 3
    }
  ],
  "technical": [
    {
      "question": "<the question>",
      "whyAsked": "<what skill this tests>",
      "difficulty": 1 | 2 | 3
    }
  ],
  "roleSpecific": [
    {
      "question": "<the question>",
      "whyAsked": "<what this reveals about fit>",
      "difficulty": 1 | 2 | 3
    }
  ],
  "culture": [
    {
      "question": "<the question>",
      "whyAsked": "<what value/trait this tests>",
      "difficulty": 1 | 2 | 3
    }
  ]
}

Difficulty: 1=easy, 2=moderate, 3=hard. Be realistic — base predictions on the JD language and company stage.`;
}

const QuestionSchema = z.object({
  question: z.string(),
  whyAsked: z.string(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

export const PredictedQuestionsSchema = z.object({
  behavioral: z.array(QuestionSchema),
  technical: z.array(QuestionSchema),
  roleSpecific: z.array(QuestionSchema),
  culture: z.array(QuestionSchema),
});

export type PredictedQuestions = z.infer<typeof PredictedQuestionsSchema>;
