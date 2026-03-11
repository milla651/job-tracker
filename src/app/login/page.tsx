"use client";

import { useState } from "react";
import Link from "next/link";
import { loginUser } from "@/app/actions/auth";
import { Input } from "@/components/ui/Input";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { OnboardingLayout } from "@/components/OnboardingLayout";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginUser(formData);
      if (result?.error) {
        setError(result.error);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // Redirect happens on success
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <OnboardingLayout
      step={1}
      totalSteps={2}
      title="Welcome back"
      description="Sign in to your job tracking dashboard">
      <form action={handleSubmit} className="space-y-5 w-full max-w-sm">
        {/* Error */}
        {error && (
          <div
            className="p-4 rounded-xl border text-sm font-medium
            bg-red-50 border-red-200 text-red-700
            dark:bg-red-950/30 dark:border-red-800/50 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Email Address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            disabled={isLoading}
            className="h-11 rounded-xl border-stone-200 dark:border-stone-700
              bg-white dark:bg-stone-900
              focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={isLoading}
              className="h-11 pr-10 rounded-xl border-stone-200 dark:border-stone-700
                bg-white dark:bg-stone-900
                focus:ring-teal-500 focus:border-teal-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors
                text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              tabIndex={-1}>
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-xl flex items-center justify-center gap-2
            text-sm font-semibold transition-all duration-200 mt-2
            bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/20
            dark:bg-teal-500 dark:text-stone-950 dark:hover:bg-teal-400 dark:shadow-teal-500/15
            disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
          <span className="text-xs text-stone-400 dark:text-stone-600 shrink-0">
            New to JobTracker?
          </span>
          <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
        </div>

        {/* Register link */}
        <Link
          href="/register"
          className="w-full h-11 rounded-xl flex items-center justify-center gap-2
            text-sm font-semibold transition-all duration-200 border-2
            border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300
            dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:border-stone-600">
          Create a Free Account
          <ArrowRight className="w-4 h-4" />
        </Link>
      </form>
    </OnboardingLayout>
  );
}