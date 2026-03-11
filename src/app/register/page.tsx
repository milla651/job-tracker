"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/auth";
import { Input } from "@/components/ui/Input";
import { Loader2, Eye, EyeOff, Check, ArrowRight } from "lucide-react";
import { OnboardingLayout } from "@/components/OnboardingLayout";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");

  const strength = (() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    return score;
  })();

  const strengthLabel =
    strength <= 1
      ? "Weak"
      : strength <= 2
        ? "Fair"
        : strength <= 3
          ? "Good"
          : "Strong";

  const strengthColor =
    strength <= 1
      ? "text-red-500"
      : strength <= 2
        ? "text-orange-500"
        : strength <= 3
          ? "text-teal-500"
          : "text-teal-600 dark:text-teal-400";

  const barColor = (level: number) =>
    strength >= level
      ? strength <= 1
        ? "bg-red-400"
        : strength <= 2
          ? "bg-orange-400"
          : "bg-teal-500"
      : "bg-stone-200 dark:bg-stone-700";

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const pw = formData.get("password") as string;
    const confirm = formData.get("confirmPassword") as string;

    if (pw !== confirm) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (pw.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerUser(formData);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else if (result?.success) {
        setSuccess("Account created!");
        const email = formData.get("email") as string;
        setTimeout(
          () => router.push(`/verify-email?email=${encodeURIComponent(email)}`),
          1000,
        );
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  // ── SUCCESS STATE ──────────────────────────────
  if (success) {
    return (
      <OnboardingLayout
        step={2}
        totalSteps={2}
        title="Account Created!"
        description="One last step — verify your email">
        <div className="flex flex-col items-center gap-5 w-full max-w-sm text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center
            bg-teal-50 dark:bg-teal-950/50">
            <Check className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <p className="text-stone-500 dark:text-stone-400 leading-relaxed">
            We&apos;ve sent a verification link to your email. Click it to activate
            your account and start tracking.
          </p>
        </div>
      </OnboardingLayout>
    );
  }

  // ── REGISTER FORM ──────────────────────────────
  return (
    <OnboardingLayout
      step={1}
      totalSteps={2}
      title="Create Your Account"
      description="Start organising your job search in 2 minutes">
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

        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Full Name
          </label>
          <Input
            id="name"
            name="name"
            placeholder="Jane Doe"
            required
            disabled={isLoading}
            className="h-11 rounded-xl border-stone-200 dark:border-stone-700
              bg-white dark:bg-stone-900
              focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

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
            disabled={isLoading}
            className="h-11 rounded-xl border-stone-200 dark:border-stone-700
              bg-white dark:bg-stone-900
              focus:ring-teal-500 focus:border-teal-500"
          />
          <p className="text-xs text-stone-400 dark:text-stone-600">
            We&apos;ll send a verification link to this address
          </p>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Strength meter */}
          {password && (
            <div className="space-y-1.5">
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`flex-1 rounded-full transition-all duration-300 ${barColor(level)}`}
                  />
                ))}
              </div>
              <p className="text-xs text-stone-400 dark:text-stone-600">
                Strength:{" "}
                <span className={`font-semibold ${strengthColor}`}>
                  {strengthLabel}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="h-11 pr-10 rounded-xl border-stone-200 dark:border-stone-700
                bg-white dark:bg-stone-900
                focus:ring-teal-500 focus:border-teal-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors
                text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              tabIndex={-1}>
              {showConfirmPassword ? (
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
            disabled:opacity-60 disabled:cursor-not-allowed">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
          <span className="text-xs text-stone-400 dark:text-stone-600 shrink-0">
            Already have an account?
          </span>
          <div className="flex-1 h-px bg-stone-200 dark:bg-stone-800" />
        </div>

        {/* Login link */}
        <Link
          href="/login"
          className="w-full h-11 rounded-xl flex items-center justify-center gap-2
            text-sm font-semibold transition-all duration-200 border-2
            border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300
            dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:border-stone-600">
          Sign In Instead
          <ArrowRight className="w-4 h-4" />
        </Link>
      </form>
    </OnboardingLayout>
  );
}