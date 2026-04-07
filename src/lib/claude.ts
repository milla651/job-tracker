import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

// ── Model constants ──────────────────────────────────────────────────────────
export const CLAUDE_HAIKU = "claude-haiku-4-5-20251001"; // fast + cheap — bulk ops
export const CLAUDE_SONNET = "claude-sonnet-4-6"; // best quality — user-visible output

// ── Singleton client ─────────────────────────────────────────────────────────
let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

// ── Per-user rate limiting ───────────────────────────────────────────────────
const DAILY_LIMIT = parseInt(process.env.AI_DAILY_CALL_LIMIT ?? "50", 10);

// In-memory counter (resets on server restart — good enough for daily limits)
const callCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): void {
  const now = Date.now();
  const entry = callCounts.get(userId);

  if (!entry || entry.resetAt < now) {
    callCounts.set(userId, { count: 1, resetAt: now + 86_400_000 });
    return;
  }

  if (entry.count >= DAILY_LIMIT) {
    throw new Error(
      `AI daily limit reached (${DAILY_LIMIT} calls/day). Try again tomorrow.`
    );
  }

  entry.count += 1;
}

// ── Core call function ───────────────────────────────────────────────────────
export interface AiCallOptions {
  userId: string;
  systemPrompt: string;
  userMessage: string;
  model?: string;
  maxTokens?: number;
}

export async function callClaude({
  userId,
  systemPrompt,
  userMessage,
  model = CLAUDE_SONNET,
  maxTokens = 4096,
}: AiCallOptions): Promise<string> {
  checkRateLimit(userId);

  const response = await getClient().messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const block = response.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  return block.text;
}

// ── JSON call helper ─────────────────────────────────────────────────────────
// Forces Claude to return valid JSON by appending instruction and parsing.
export async function callClaudeJson<T>(
  options: AiCallOptions
): Promise<T> {
  const text = await callClaude({
    ...options,
    userMessage:
      options.userMessage +
      "\n\nRespond with valid JSON only. No markdown fences. No explanation.",
  });

  // Strip markdown fences if Claude adds them anyway
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned) as T;
}

// ── Feature flag ─────────────────────────────────────────────────────────────
export function isAiEnabled(): boolean {
  return (
    !!process.env.ANTHROPIC_API_KEY &&
    process.env.ENABLE_AI_EVALUATION !== "false"
  );
}
