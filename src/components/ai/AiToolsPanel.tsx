"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  generateCoverLetter,
  tailorResume,
  generateNegotiationScript,
} from "@/app/actions/ai-documents";
import type { TailoredResume } from "@/lib/prompts/tailor-resume";
import {
  FileText,
  Wand2,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { GenerateCVButton } from "@/components/cv/GenerateCVButton";

interface AiToolsPanelProps {
  jobApplicationId: string;
  hasOffer: boolean;
}

type ToolKey = "cover-letter" | "resume" | "negotiation";

interface ToolState {
  output: string | TailoredResume | null;
  error: string | null;
}

export function AiToolsPanel({ jobApplicationId, hasOffer }: AiToolsPanelProps) {
  const [open, setOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolKey | null>(null);
  const [results, setResults] = useState<Partial<Record<ToolKey, ToolState>>>({});
  const [copied, setCopied] = useState<ToolKey | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(tool: ToolKey) {
    setActiveTool(tool);
    startTransition(async () => {
      if (tool === "cover-letter") {
        const res = await generateCoverLetter(jobApplicationId);
        setResults((prev) => ({
          ...prev,
          "cover-letter": res.success
            ? { output: res.text, error: null }
            : { output: null, error: res.error },
        }));
      } else if (tool === "resume") {
        const res = await tailorResume(jobApplicationId);
        setResults((prev) => ({
          ...prev,
          resume: res.success
            ? { output: res.resume, error: null }
            : { output: null, error: res.error },
        }));
      } else if (tool === "negotiation") {
        const res = await generateNegotiationScript(jobApplicationId);
        setResults((prev) => ({
          ...prev,
          negotiation: res.success
            ? { output: res.text, error: null }
            : { output: null, error: res.error },
        }));
      }
      setActiveTool(null);
    });
  }

  function copyText(tool: ToolKey, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(tool);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function resumeToText(resume: TailoredResume): string {
    const lines: string[] = [];
    lines.push("PROFESSIONAL SUMMARY");
    lines.push(resume.professionalSummary, "");
    lines.push("EXPERIENCE");
    resume.experience.forEach((exp) => {
      lines.push(`${exp.title} @ ${exp.company} (${exp.period})`);
      exp.bullets.forEach((b) => lines.push(`• ${b}`));
      lines.push("");
    });
    lines.push("SKILLS");
    lines.push(`Primary: ${resume.skills.primary.join(", ")}`);
    lines.push(`Secondary: ${resume.skills.secondary.join(", ")}`, "");
    if (resume.tailoringNotes) {
      lines.push("--- TAILORING NOTES ---");
      lines.push(resume.tailoringNotes);
    }
    return lines.join("\n");
  }

  return (
    <div className="glass-card ai-glow-ring rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Wand2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">AI Tools</h2>
            <p className="text-xs text-muted-foreground">Cover letter · Resume · Negotiation</p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-4 border-t border-border/50">
          {/* CV Generation (Python Backend) */}
          <div className="pt-4 border-b border-border/50 pb-4">
            <GenerateCVButton jobApplicationId={jobApplicationId} company="this job" />
          </div>

          {/* Cover Letter */}
          <ToolSection
            tool="cover-letter"
            label="Cover Letter"
            description="AI-written, tailored to this JD"
            icon={<FileText className="w-4 h-4 text-blue-400" />}
            isRunning={isPending && activeTool === "cover-letter"}
            result={results["cover-letter"]}
            onRun={() => run("cover-letter")}
            onCopy={() => {
              const text = results["cover-letter"]?.output as string;
              if (text) copyText("cover-letter", text);
            }}
            isCopied={copied === "cover-letter"}
            outputText={results["cover-letter"]?.output as string | undefined}
          />

          {/* Resume Tailoring */}
          <ToolSection
            tool="resume"
            label="Tailor Resume"
            description="ATS-optimized for this role"
            icon={<Wand2 className="w-4 h-4 text-success" />}
            isRunning={isPending && activeTool === "resume"}
            result={results["resume"]}
            onRun={() => run("resume")}
            onCopy={() => {
              const resume = results["resume"]?.output as TailoredResume | undefined;
              if (resume) copyText("resume", resumeToText(resume));
            }}
            isCopied={copied === "resume"}
            outputText={
              results["resume"]?.output
                ? resumeToText(results["resume"].output as TailoredResume)
                : undefined
            }
          />

          {/* Negotiation Script */}
          <ToolSection
            tool="negotiation"
            label="Negotiation Script"
            description={hasOffer ? "Personalized script for your offer" : "Add offer details first"}
            icon={<DollarSign className="w-4 h-4 text-amber-400" />}
            isRunning={isPending && activeTool === "negotiation"}
            result={results["negotiation"]}
            onRun={() => run("negotiation")}
            onCopy={() => {
              const text = results["negotiation"]?.output as string;
              if (text) copyText("negotiation", text);
            }}
            isCopied={copied === "negotiation"}
            outputText={results["negotiation"]?.output as string | undefined}
            disabled={!hasOffer}
          />
        </div>
      )}
    </div>
  );
}

interface ToolSectionProps {
  tool: ToolKey;
  label: string;
  description: string;
  icon: React.ReactNode;
  isRunning: boolean;
  result: ToolState | undefined;
  onRun: () => void;
  onCopy: () => void;
  isCopied: boolean;
  outputText: string | undefined;
  disabled?: boolean;
}

function ToolSection({
  label,
  description,
  icon,
  isRunning,
  result,
  onRun,
  onCopy,
  isCopied,
  outputText,
  disabled,
}: ToolSectionProps) {
  return (
    <div className="pt-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onRun}
          disabled={isRunning || disabled}
          className="shrink-0"
        >
          {isRunning ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : null}
          {isRunning ? "Generating…" : result?.output ? "Regenerate" : "Generate"}
        </Button>
      </div>

      {result?.error && (
        <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
          {result.error}
        </p>
      )}

      {outputText && (
        <div className="relative">
          <pre className="text-xs text-foreground/80 whitespace-pre-wrap bg-background/40 border border-border/50 rounded-xl p-4 max-h-64 overflow-y-auto leading-relaxed">
            {outputText}
          </pre>
          <button
            onClick={onCopy}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 border border-border/50 hover:bg-background transition-colors"
            title="Copy to clipboard"
          >
            {isCopied ? (
              <Check className="w-3 h-3 text-success" />
            ) : (
              <Copy className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
