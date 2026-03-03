"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
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

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
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
    } catch (e) {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <OnboardingLayout
        step={2}
        totalSteps={2}
        title="Account Created!"
        description="Verify your email to get started">
        <div className="flex flex-col items-center justify-center gap-4 w-full max-w-sm">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-center text-muted-foreground">
            We've sent you a verification email. Click the link to activate your
            account.
          </p>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      step={1}
      totalSteps={2}
      title="Create Your Account"
      description="Start organizing your job search in 2 minutes">
      <form action={handleSubmit} className="space-y-5 w-full max-w-sm">
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name</label>
          <Input
            id="name"
            name="name"
            placeholder="John Doe"
            required
            disabled={isLoading}
            className="h-11"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            disabled={isLoading}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            We'll send a verification link to this email
          </p>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
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

          {/* Password Strength */}
          {password && (
            <div className="space-y-2">
              <div className="flex gap-1 h-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`flex-1 rounded-full transition-all ${
                      strength >= level ? "bg-green-500" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Strength:{" "}
                <span
                  className={
                    strength >= 4
                      ? "text-green-500 font-medium"
                      : strength >= 3
                        ? "text-blue-500 font-medium"
                        : strength >= 2
                          ? "text-yellow-500 font-medium"
                          : "text-red-500 font-medium"
                  }>
                  {strength <= 1
                    ? "Weak"
                    : strength <= 2
                      ? "Fair"
                      : strength <= 3
                        ? "Good"
                        : "Strong"}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Confirm Password</label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}>
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-gradient-brand text-white font-semibold gap-2 mt-6">
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
        </Button>

        {/* Divider */}
        <div className="relative h-px bg-border my-6">
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-background px-2 text-xs text-muted-foreground">
            Already have an account?
          </span>
        </div>

        {/* Sign In Link */}
        <Button asChild variant="outline" className="w-full h-11 border-2">
          <Link href="/login">
            Sign In Instead
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </form>
    </OnboardingLayout>
  );
}
