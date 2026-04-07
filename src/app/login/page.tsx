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
      description="Sign in to your CareerOS dashboard">
      <form action={handleSubmit} className="space-y-5 w-full max-w-sm">
        {/* Error */}
        {error && (
          <div
            className="p-4 rounded-xl border text-sm font-medium
            bg-destructive/10 border-destructive/30 text-destructive">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
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
            className="h-11 rounded-xl border-input bg-card focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline transition-colors">
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
              className="h-11 pr-10 rounded-xl border-input bg-card focus:ring-primary focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors
                text-muted-foreground hover:text-foreground"
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
            bg-primary text-primary-foreground hover:bg-primary-hover shadow-md shadow-primary/20
            disabled:opacity-60 disabled:cursor-not-allowed">
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
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground shrink-0">
            New to CareerOS?
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Register link */}
        <Link
          href="/register"
          className="w-full h-11 rounded-xl flex items-center justify-center gap-2
            text-sm font-semibold transition-all duration-200 border-2
            border-border text-foreground hover:bg-muted hover:border-border-strong">
          Create a Free Account
          <ArrowRight className="w-4 h-4" />
        </Link>
      </form>
    </OnboardingLayout>
  );
}
