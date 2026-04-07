"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  upsertProfileStep1,
  upsertProfileStep2,
  upsertProfileStep3,
  saveCvContent,
} from "@/app/actions/profile";
import type { UserProfile } from "@prisma/client";
import { MapPin, Briefcase, DollarSign, ChevronRight, ChevronLeft, X, Plus, Upload, FileText, CheckCircle } from "lucide-react";

interface ProfileWizardProps {
  existingProfile: UserProfile | null;
  onComplete?: () => void;
  onSkip?: () => void;
}

const SENIORITY_OPTIONS = ["JUNIOR", "MID", "SENIOR", "STAFF", "PRINCIPAL"] as const;
const WORK_PREF_OPTIONS = [
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "On-site" },
] as const;

const COMMON_ROLES = [
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Engineer",
  "Product Manager",
  "Data Engineer",
  "ML Engineer",
  "DevOps / Platform Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full-Stack Engineer",
  "Engineering Manager",
  "Solutions Architect",
];

export function ProfileWizard({
  existingProfile,
  onComplete,
  onSkip,
}: ProfileWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Step 1 state
  const [location, setLocation] = useState(existingProfile?.location ?? "");
  const [timezone, setTimezone] = useState(existingProfile?.timezone ?? "");
  const [visaSponsorship, setVisaSponsorship] = useState(existingProfile?.visaSponsorship ?? false);
  const [workPreference, setWorkPreference] = useState<"REMOTE" | "HYBRID" | "ONSITE">(
    (existingProfile?.workPreference as "REMOTE" | "HYBRID" | "ONSITE") ?? "HYBRID"
  );

  // Step 2 state
  const [primaryRoles, setPrimaryRoles] = useState<string[]>(
    existingProfile?.primaryRoles ?? []
  );
  const [roleInput, setRoleInput] = useState("");
  const [seniority, setSeniority] = useState<typeof SENIORITY_OPTIONS[number]>(
    (existingProfile?.seniority as typeof SENIORITY_OPTIONS[number]) ?? "MID"
  );
  const [headline, setHeadline] = useState(existingProfile?.headline ?? "");
  const [exitStory, setExitStory] = useState(existingProfile?.exitStory ?? "");

  // Step 3 state
  const [superpower1, setSuperpower1] = useState(existingProfile?.superpower1 ?? "");
  const [superpower2, setSuperpower2] = useState(existingProfile?.superpower2 ?? "");
  const [superpower3, setSuperpower3] = useState(existingProfile?.superpower3 ?? "");
  const [targetCompMin, setTargetCompMin] = useState(
    existingProfile?.targetCompMin?.toString() ?? ""
  );
  const [targetCompMax, setTargetCompMax] = useState(
    existingProfile?.targetCompMax?.toString() ?? ""
  );
  const [minimumComp, setMinimumComp] = useState(
    existingProfile?.minimumComp?.toString() ?? ""
  );
  const [linkedInUrl, setLinkedInUrl] = useState(existingProfile?.linkedInUrl ?? "");
  const [cvFileName, setCvFileName] = useState<string | null>(
    existingProfile?.baseCvContent ? "CV uploaded" : null
  );
  const [cvUploading, setCvUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCvUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("CV must be under 5MB");
      return;
    }
    setCvUploading(true);
    setError(null);
    try {
      // Use pdf-parse via a FormData POST to extract text
      const formData = new FormData();
      formData.append("cv", file);
      const res = await fetch("/api/extract-cv", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Extraction failed");
      const { text } = await res.json() as { text: string };
      const result = await saveCvContent(text);
      if (!result.success) throw new Error(result.error);
      setCvFileName(file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "CV upload failed");
    } finally {
      setCvUploading(false);
    }
  };

  const addRole = (role: string) => {
    const trimmed = role.trim();
    if (trimmed && !primaryRoles.includes(trimmed)) {
      setPrimaryRoles([...primaryRoles, trimmed]);
    }
    setRoleInput("");
  };

  const removeRole = (role: string) => {
    setPrimaryRoles(primaryRoles.filter((r) => r !== role));
  };

  const handleNext = () => {
    setError(null);
    startTransition(async () => {
      if (step === 1) {
        const result = await upsertProfileStep1({
          location: location || undefined,
          timezone: timezone || undefined,
          visaSponsorship,
          workPreference,
        });
        if (!result.success) return setError(result.error ?? "Failed to save");
        setStep(2);
      } else if (step === 2) {
        if (primaryRoles.length === 0) {
          return setError("Add at least one target role");
        }
        const result = await upsertProfileStep2({
          primaryRoles,
          seniority,
          headline: headline || undefined,
          exitStory: exitStory || undefined,
        });
        if (!result.success) return setError(result.error ?? "Failed to save");
        setStep(3);
      } else if (step === 3) {
        const result = await upsertProfileStep3({
          superpower1: superpower1 || undefined,
          superpower2: superpower2 || undefined,
          superpower3: superpower3 || undefined,
          targetCompMin: targetCompMin ? parseInt(targetCompMin, 10) : undefined,
          targetCompMax: targetCompMax ? parseInt(targetCompMax, 10) : undefined,
          minimumComp: minimumComp ? parseInt(minimumComp, 10) : undefined,
          linkedInUrl: linkedInUrl || undefined,
        });
        if (!result.success) return setError(result.error ?? "Failed to save");
        onComplete?.();
        router.refresh();
      }
    });
  };

  const steps = [
    { number: 1, label: "Identity", icon: MapPin },
    { number: 2, label: "Target Roles", icon: Briefcase },
    { number: 3, label: "Compensation", icon: DollarSign },
  ];

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.number} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-semibold transition-colors ${
              step === s.number
                ? "bg-teal-500 border-teal-500 text-white"
                : step > s.number
                ? "bg-teal-500/20 border-teal-500/50 text-teal-600 dark:text-teal-400"
                : "border-stone-300 dark:border-stone-600 text-stone-400"
            }`}>
              {step > s.number ? "✓" : s.number}
            </div>
            <span className={`text-sm hidden sm:block ${
              step === s.number ? "font-medium text-stone-800 dark:text-stone-100" : "text-stone-500"
            }`}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 ${step > s.number ? "bg-teal-500/50" : "bg-stone-200 dark:bg-stone-700"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Identity */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100">Where are you?</h2>
            <p className="text-sm text-stone-500 mt-1">Helps AI evaluate remote vs. on-site requirements.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Location
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Timezone
              </label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="PST / UTC-8"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Work Preference
              </label>
              <div className="flex gap-2">
                {WORK_PREF_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setWorkPreference(opt.value)}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      workPreference === opt.value
                        ? "bg-teal-500 border-teal-500 text-white"
                        : "border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-teal-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setVisaSponsorship(!visaSponsorship)}
                className={`relative w-10 h-5.5 rounded-full transition-colors ${
                  visaSponsorship ? "bg-teal-500" : "bg-stone-300 dark:bg-stone-600"
                }`}
              >
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm ${
                  visaSponsorship ? "translate-x-5" : "translate-x-0.5"
                }`} />
              </button>
              <span className="text-sm text-stone-600 dark:text-stone-400">
                I need visa sponsorship
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Target Roles */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100">What are you targeting?</h2>
            <p className="text-sm text-stone-500 mt-1">AI uses this to score how well a job fits you.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Target Roles
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addRole(roleInput); }
                  }}
                  placeholder="Type a role and press Enter"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => addRole(roleInput)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {/* Quick add suggestions */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {COMMON_ROLES.filter((r) => !primaryRoles.includes(r)).slice(0, 6).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => addRole(role)}
                    className="text-xs px-2 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-900/30 dark:hover:text-teal-400 transition-colors"
                  >
                    + {role}
                  </button>
                ))}
              </div>
              {/* Selected roles */}
              {primaryRoles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {primaryRoles.map((role) => (
                    <span key={role} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-sm">
                      {role}
                      <button type="button" onClick={() => removeRole(role)} className="hover:text-red-500">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Seniority Level
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {SENIORITY_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSeniority(s)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      seniority === s
                        ? "bg-teal-500 border-teal-500 text-white"
                        : "border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-teal-300"
                    }`}
                  >
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                One-line Headline <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Staff engineer specializing in distributed systems"
                maxLength={200}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                What makes you unique? <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={exitStory}
                onChange={(e) => setExitStory(e.target.value)}
                placeholder="Built and launched 3 products used by 50k+ people. Now focused on..."
                maxLength={1000}
                rows={3}
                className="w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-transparent px-3 py-2 text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Compensation */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100">What's your floor?</h2>
            <p className="text-sm text-stone-500 mt-1">
              Your minimum is private — AI uses it to flag low offers but never shares it.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Target Min ($)
                </label>
                <Input
                  type="number"
                  value={targetCompMin}
                  onChange={(e) => setTargetCompMin(e.target.value)}
                  placeholder="150000"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                  Target Max ($)
                </label>
                <Input
                  type="number"
                  value={targetCompMax}
                  onChange={(e) => setTargetCompMax(e.target.value)}
                  placeholder="200000"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                Walk-away Minimum ($) <span className="text-stone-400 text-xs font-normal">— private</span>
              </label>
              <Input
                type="number"
                value={minimumComp}
                onChange={(e) => setMinimumComp(e.target.value)}
                placeholder="120000"
                className="w-full"
              />
              <p className="text-xs text-stone-400 mt-1">
                AI will flag any offer below this threshold.
              </p>
            </div>

            <div className="border-t border-stone-100 dark:border-stone-800 pt-4 space-y-3">
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Your superpowers</p>
              <p className="text-xs text-stone-500">
                These are used in resume tailoring and cover letters to highlight what makes you unique.
              </p>
              {[
                { value: superpower1, setter: setSuperpower1, placeholder: "Ship fast without cutting corners" },
                { value: superpower2, setter: setSuperpower2, placeholder: "Debug anything — I love root cause analysis" },
                { value: superpower3, setter: setSuperpower3, placeholder: "Bridge between technical and non-technical teams" },
              ].map((sp, i) => (
                <Input
                  key={i}
                  value={sp.value}
                  onChange={(e) => sp.setter(e.target.value)}
                  placeholder={sp.placeholder}
                  maxLength={200}
                  className="w-full"
                />
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                LinkedIn URL <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <Input
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                type="url"
                className="w-full"
              />
            </div>

            {/* CV Upload */}
            <div className="border-t border-stone-100 dark:border-stone-800 pt-4">
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Upload your CV <span className="text-stone-400 text-xs font-normal">(PDF, max 5MB)</span>
              </p>
              <p className="text-xs text-stone-500 mb-3">
                AI uses your CV to match you to jobs and tailor your resume automatically.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCvUpload(file);
                }}
              />
              {cvFileName ? (
                <div className="flex items-center gap-2 p-3 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/30">
                  <CheckCircle className="h-4 w-4 text-teal-500 shrink-0" />
                  <span className="text-sm text-teal-700 dark:text-teal-300 truncate">{cvFileName}</span>
                  <button
                    type="button"
                    onClick={() => { setCvFileName(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="ml-auto text-stone-400 hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={cvUploading}
                  className="w-full flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-stone-200 dark:border-stone-700 hover:border-teal-300 dark:hover:border-teal-600 transition-colors"
                >
                  {cvUploading ? (
                    <span className="text-sm text-stone-500">Extracting text...</span>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 text-stone-400" />
                      <span className="text-sm text-stone-500">Click to upload PDF resume</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400 mt-3">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100 dark:border-stone-800">
        <div className="flex gap-2">
          {step > 1 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setError(null); setStep(step - 1); }}
              disabled={isPending}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          {onSkip && (
            <Button type="button" variant="ghost" onClick={onSkip} disabled={isPending} className="text-stone-400">
              Skip for now
            </Button>
          )}
        </div>
        <Button onClick={handleNext} disabled={isPending} className="bg-teal-500 hover:bg-teal-600 text-white">
          {isPending ? "Saving..." : step === 3 ? "Complete Profile" : (
            <>Next <ChevronRight className="h-4 w-4 ml-1" /></>
          )}
        </Button>
      </div>
    </div>
  );
}
