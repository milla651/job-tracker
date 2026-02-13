"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Briefcase, Loader2, ArrowLeft, Eye, EyeOff, Check, X } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    return score;
  };

  const strength = calculateStrength(password);

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-muted";
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-yellow-500";
    if (score <= 3) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = (score: number) => {
    if (score === 0) return "";
    if (score <= 1) return "Weak";
    if (score <= 2) return "Fair";
    if (score <= 3) return "Good";
    return "Strong";
  };

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
        setSuccess(result.success as string);
        setIsLoading(false);
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }

    // Only set loading false if we didn't redirect
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Mesh Background */}
      <div className="absolute inset-0 bg-mesh dark:bg-mesh-dark" />
      <div className="absolute inset-0 bg-aurora" />

      {/* Floating Orbs */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-float-delayed" />

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Back to Home Link */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      {/* Register Card */}
      <div className="relative w-full max-w-md">
        <div className="glass-card p-8 md:p-10">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent">
              <Briefcase className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create an account
            </h1>
            <p className="text-muted-foreground">
              Start tracking your job applications today
            </p>
          </div>

          {/* Form */}
          {success ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-center">
                <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-3">
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <h3 className="font-semibold text-lg">Check your email!</h3>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">We've sent you a verification link. Please check your inbox to complete your registration.</p>
            </div>
          ) : (
            <form action={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Input
                id="name"
                name="name"
                label="Full Name"
                placeholder="John Doe"
                autoComplete="name"
                required
              />

              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="john@example.com"
                required
                autoComplete="email"
              />

              <div className="space-y-2">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                />

                {/* Password Strength Meter */}
                {password && (
                  <div className="space-y-2 pt-1 transition-all duration-300">
                    <div className="flex gap-1 h-1.5 w-full">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-full flex-1 rounded-full transition-colors duration-300 ${strength >= level ? getStrengthColor(strength) : "bg-muted"
                            }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground px-0.5">
                      <span>Strength: <span className={`font-medium ${strength >= 3 ? 'text-green-500' : strength === 2 ? 'text-yellow-500' : 'text-red-500'}`}>{getStrengthText(strength)}</span></span>
                      <span className="flex gap-2">
                        {password.length >= 8 ? <Check className="w-3 h-3 text-green-500" /> : <span className="w-3 h-3 block bg-muted rounded-full" />}
                        {/[A-Z]/.test(password) ? <span className="text-[10px] bg-green-500/10 text-green-500 px-1 rounded">ABC</span> : <span className="text-[10px] bg-muted text-muted-foreground px-1 rounded">ABC</span>}
                        {/[0-9]/.test(password) ? <span className="text-[10px] bg-green-500/10 text-green-500 px-1 rounded">123</span> : <span className="text-[10px] bg-muted text-muted-foreground px-1 rounded">123</span>}
                        {/[^A-Za-z0-9]/.test(password) ? <span className="text-[10px] bg-green-500/10 text-green-500 px-1 rounded">#@$</span> : <span className="text-[10px] bg-muted text-muted-foreground px-1 rounded">#@$</span>}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          )}

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
