"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { createJob, updateJob } from "@/app/actions/jobs";
import { useConfetti } from "@/hooks/useConfetti";
import { JobApplication } from "@prisma/client";
import {
  Loader2,
  Building2,
  Briefcase,
  MapPin,
  Globe,
  DollarSign,
  Target,
  FileText,
  StickyNote,
  Sparkles,
  ChevronRight,
  Rocket,
  Brain,
  Star,
  Heart,
  Zap,
  PartyPopper,
  Trophy
} from "lucide-react";

interface JobFormProps {
  job?: JobApplication;
  mode: "create" | "edit";
}

const statusOptions = [
  { value: "WISHLIST", label: "🌟 Dream Job" },
  { value: "APPLIED", label: "📤 Applied & Waiting" },
  { value: "PHONE_SCREEN", label: "📞 First Contact" },
  { value: "INTERVIEW", label: "🎤 Crushing It" },
  { value: "TECHNICAL", label: "💻 Code Mode" },
  { value: "OFFER", label: "📋 Offer Received" },
  { value: "ACCEPTED", label: "🎉 Let's Go!" },
  { value: "REJECTED", label: "❌ Their Loss" },
  { value: "WITHDRAWN", label: "↩️ Changed Mind" },
];

export function JobForm({ job, mode }: JobFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { triggerFireworks } = useConfetti();

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const status = formData.get("status") as string;
    const isWin = ["OFFER", "ACCEPTED"].includes(status);

    try {
      if (mode === "create") {
        const result = await createJob(formData);
        if (result?.error) {
          setError(result.error);
        } else {
          if (isWin) triggerFireworks();
          router.push("/jobs");
        }
      } else if (job) {
        const result = await updateJob(job.id, formData);
        if (result?.error) {
          setError(result.error);
        } else {
          if (isWin) triggerFireworks();
          router.push(`/jobs/${job.id}`);
        }
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Light mode specific styles with proper contrast
  const lightModeStyles = {
    container: "bg-white/90",
    input: "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500",
    label: "text-gray-700 font-medium",
    icon: "text-gray-600",
    helper: "text-gray-600",
    card: "bg-white border-gray-200",
  };

  // Dark mode specific styles with proper contrast
  const darkModeStyles = {
    container: "dark:bg-gray-900/90",
    input: "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400",
    label: "dark:text-gray-200",
    icon: "dark:text-gray-300",
    helper: "dark:text-gray-400",
    card: "dark:bg-gray-800 dark:border-gray-700",
  };

  return (
    <div className="relative animate-in fade-in duration-700">
      {/* Main Glass Container - Improved contrast */}
      <div className={`relative backdrop-blur-xl ${lightModeStyles.container} ${darkModeStyles.container} 
                      rounded-3xl shadow-2xl border ${lightModeStyles.card} ${darkModeStyles.card} 
                      overflow-hidden group/main`}>

        {/* Subtle Background Gradient - More visible in light mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 
                      dark:from-primary/5 dark:via-transparent dark:to-accent/5" />

        {/* Grid Pattern - Better contrast */}
        <div
          className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-8 md:p-10">
          {/* Header Section - Strong contrast */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg
                            hover:shadow-xl transition-all duration-300">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {mode === "create" ? "Launch Your Journey" : "Navigate Your Path"}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <p className="text-gray-600 dark:text-gray-300">
                    {mode === "create"
                      ? "Every great opportunity starts with a single step."
                      : "Update your progress and keep climbing towards your goals."}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Indicator - Solid colors */}
            <div className="flex gap-2 mt-6">
              <div className="h-1 w-1/3 rounded-full bg-primary/60 dark:bg-primary/50" />
              <div className="h-1 w-1/3 rounded-full bg-primary/40 dark:bg-primary/30" />
              <div className="h-1 w-1/3 rounded-full bg-primary/20 dark:bg-primary/20" />
            </div>
          </div>

          {/* Error Message - High contrast */}
          {error && (
            <div className="mb-6 p-5 rounded-2xl bg-red-50 dark:bg-red-950/50 
                          border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900">
                  <Brain className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <p className="font-medium text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          <form action={handleSubmit} className="space-y-8">
            {/* Company & Position - High contrast inputs */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Company */}
              <div className="relative">
                <label htmlFor="company" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary dark:text-primary-400" />
                    Company *
                  </span>
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="e.g., Google"
                  defaultValue={job?.company}
                  required
                  className="w-full px-4 py-3 rounded-xl
                           bg-white dark:bg-gray-800 
                           border-2 border-gray-200 dark:border-gray-700
                           text-gray-900 dark:text-white
                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                           focus:border-primary focus:ring-4 focus:ring-primary/20
                           transition-all duration-200
                           shadow-sm hover:shadow"
                />
              </div>

              {/* Position */}
              <div className="relative">
                <label htmlFor="position" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary dark:text-primary-400" />
                    Position *
                  </span>
                </label>
                <input
                  id="position"
                  name="position"
                  type="text"
                  placeholder="e.g., Senior Software Engineer"
                  defaultValue={job?.position}
                  required
                  className="w-full px-4 py-3 rounded-xl
                           bg-white dark:bg-gray-800 
                           border-2 border-gray-200 dark:border-gray-700
                           text-gray-900 dark:text-white
                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                           focus:border-primary focus:ring-4 focus:ring-primary/20
                           transition-all duration-200
                           shadow-sm hover:shadow"
                />
              </div>
            </div>

            {/* Status Select */}
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary dark:text-primary-400" />
                  Current Stage
                </span>
              </label>
              <select
                id="status"
                name="status"
                defaultValue={job?.status || "APPLIED"}
                className="w-full px-4 py-3 rounded-xl
                         bg-white dark:bg-gray-800 
                         border-2 border-gray-200 dark:border-gray-700
                         text-gray-900 dark:text-white
                         focus:border-primary focus:ring-4 focus:ring-primary/20
                         transition-all duration-200
                         shadow-sm hover:shadow
                         cursor-pointer"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value} className="py-2">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location & Salary */}
            <div className="grid gap-6 sm:grid-cols-3">
              {/* Location */}
              <div className="sm:col-span-1">
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary dark:text-primary-400" />
                    Location
                  </span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="San Francisco, CA"
                  defaultValue={job?.location || ""}
                  className="w-full px-4 py-3 rounded-xl
                           bg-white dark:bg-gray-800 
                           border-2 border-gray-200 dark:border-gray-700
                           text-gray-900 dark:text-white
                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                           focus:border-primary focus:ring-4 focus:ring-primary/20
                           transition-all duration-200
                           shadow-sm hover:shadow"
                />
              </div>

              {/* Salary Min */}
              <div>
                <label htmlFor="salaryMin" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary dark:text-primary-400" />
                    Min Salary
                  </span>
                </label>
                <input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  placeholder="120000"
                  defaultValue={job?.salaryMin?.toString() || ""}
                  className="w-full px-4 py-3 rounded-xl
                           bg-white dark:bg-gray-800 
                           border-2 border-gray-200 dark:border-gray-700
                           text-gray-900 dark:text-white
                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                           focus:border-primary focus:ring-4 focus:ring-primary/20
                           transition-all duration-200
                           shadow-sm hover:shadow"
                />
              </div>

              {/* Salary Max */}
              <div>
                <label htmlFor="salaryMax" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary dark:text-primary-400" />
                    Max Salary
                  </span>
                </label>
                <input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  placeholder="180000"
                  defaultValue={job?.salaryMax?.toString() || ""}
                  className="w-full px-4 py-3 rounded-xl
                           bg-white dark:bg-gray-800 
                           border-2 border-gray-200 dark:border-gray-700
                           text-gray-900 dark:text-white
                           placeholder:text-gray-400 dark:placeholder:text-gray-500
                           focus:border-primary focus:ring-4 focus:ring-primary/20
                           transition-all duration-200
                           shadow-sm hover:shadow"
                />
              </div>
            </div>

            {/* Job URL */}
            <div>
              <label htmlFor="jobUrl" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary dark:text-primary-400" />
                  Job URL
                </span>
              </label>
              <input
                id="jobUrl"
                name="jobUrl"
                type="url"
                placeholder="https://..."
                defaultValue={job?.jobUrl || ""}
                className="w-full px-4 py-3 rounded-xl
                         bg-white dark:bg-gray-800 
                         border-2 border-gray-200 dark:border-gray-700
                         text-gray-900 dark:text-white
                         placeholder:text-gray-400 dark:placeholder:text-gray-500
                         focus:border-primary focus:ring-4 focus:ring-primary/20
                         transition-all duration-200
                         shadow-sm hover:shadow"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary dark:text-primary-400" />
                  Job Description
                </span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                placeholder="Paste the job description here..."
                defaultValue={job?.description || ""}
                className="w-full px-4 py-3 rounded-xl
                         bg-white dark:bg-gray-800 
                         border-2 border-gray-200 dark:border-gray-700
                         text-gray-900 dark:text-white
                         placeholder:text-gray-400 dark:placeholder:text-gray-500
                         focus:border-primary focus:ring-4 focus:ring-primary/20
                         transition-all duration-200
                         shadow-sm hover:shadow
                         resize-y"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-primary dark:text-primary-400" />
                  Personal Notes
                </span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder="Add your personal notes about this opportunity..."
                defaultValue={job?.notes || ""}
                className="w-full px-4 py-3 rounded-xl
                         bg-white dark:bg-gray-800 
                         border-2 border-gray-200 dark:border-gray-700
                         text-gray-900 dark:text-white
                         placeholder:text-gray-400 dark:placeholder:text-gray-500
                         focus:border-primary focus:ring-4 focus:ring-primary/20
                         transition-all duration-200
                         shadow-sm hover:shadow
                         resize-y"
              />
            </div>

            {/* Action Buttons - High contrast */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary hover:bg-primary/90 
                         text-white font-semibold py-4 px-6 rounded-xl
                         shadow-lg hover:shadow-xl
                         transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2
                         border-2 border-transparent
                         focus:outline-none focus:ring-4 focus:ring-primary/50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5" />
                    <span>{mode === "create" ? "Launch Application" : "Update Journey"}</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                disabled={isLoading}
                className="px-8 py-4 bg-white dark:bg-gray-800
                         border-2 border-gray-300 dark:border-gray-600
                         text-gray-700 dark:text-gray-300
                         hover:bg-gray-50 dark:hover:bg-gray-700
                         rounded-xl font-medium
                         transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700
                         flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Save for Later
              </button>
            </div>

            {/* Motivational Footer */}
            <div className="text-center pt-4">
              <div className="inline-flex items-center gap-3 px-6 py-3 
                            bg-gray-100 dark:bg-gray-800/50 
                            rounded-full border border-gray-200 dark:border-gray-700">
                <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You're one step closer to your dream job. Keep going!
                </p>
                <PartyPopper className="w-4 h-4 text-primary dark:text-primary-400" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}