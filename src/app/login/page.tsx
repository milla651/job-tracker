"use client";

import { useState } from "react";
import Link from "next/link";
import { loginUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
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
      title="Sign In"
      description="Access your job tracking dashboard">
      <form action={handleSubmit} className="space-y-6 w-full max-w-sm">
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        {/* Email Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
            disabled={isLoading}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            The email you used to create your account
          </p>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={isLoading}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}>
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <Link
            href="/forgot-password"
            className="text-xs text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-gradient-brand text-white font-semibold gap-2">
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
        </Button>

        {/* Divider */}
        <div className="relative h-px bg-border my-6">
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-background px-2 text-xs text-muted-foreground">
            New to JobTracker?
          </span>
        </div>

        {/* Sign Up Link */}
        <Button asChild variant="outline" className="w-full h-11 border-2">
          <Link href="/register">
            Create a Free Account
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </form>
    </OnboardingLayout>
  );
}
