/**
 * Negotiation script prompt — adapted from career-ops/modes/oferta.md Comp section.
 * Generates a personalized negotiation script when an offer is below target.
 */

export const NEGOTIATION_SCRIPT_PROMPT_VERSION = 1;

export function buildNegotiationScriptPrompt(params: {
  company: string;
  position: string;
  offerBase: number;
  offerEquity?: string | null;
  offerBonus?: number | null;
  targetCompMin: number;
  targetCompMax: number;
  minimumComp?: number | null;
  currency: string;
}): string {
  const offerTotal =
    params.offerBase + (params.offerBonus ?? 0);

  const targetMidpoint = Math.round(
    (params.targetCompMin + params.targetCompMax) / 2
  );

  return `Generate a negotiation script for this job offer.

OFFER DETAILS:
Company: ${params.company}
Role: ${params.position}
Base salary: ${params.offerBase.toLocaleString()} ${params.currency}
Equity: ${params.offerEquity ?? "Not specified"}
Bonus: ${params.offerBonus ? `${params.offerBonus.toLocaleString()} ${params.currency}` : "Not specified"}
Estimated total: ${offerTotal.toLocaleString()} ${params.currency}

CANDIDATE'S TARGETS:
Target range: ${params.targetCompMin.toLocaleString()}–${params.targetCompMax.toLocaleString()} ${params.currency}
Target midpoint: ${targetMidpoint.toLocaleString()} ${params.currency}
${params.minimumComp ? `Minimum (walk-away): ${params.minimumComp.toLocaleString()} ${params.currency}` : ""}

The offer is ${offerTotal < params.targetCompMin ? "BELOW" : "AT OR ABOVE"} the candidate's target range.

Generate a negotiation script with 3 parts. Return plain text:

---
OPENING (use on the initial call)
---
[Script for the first conversation — acknowledge the offer positively, then pivot to the ask]

---
COUNTER-OFFER (if they push back)
---
[Script for when they say "this is our best offer" — how to probe for flexibility]

---
WALK-AWAY (if they won't move)
---
[Script for gracefully declining if below minimum, OR accepting if at minimum]
---

Rules:
- Be professional but confident. Never apologetic.
- Use specific numbers, not ranges, in the ask.
- Anchor high — ask for top of target range.
- Frame around market data, not personal need.
- Keep each section under 100 words.
- Sound like a senior professional who has options.`;
}
