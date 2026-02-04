"use client";

import { useState } from "react";
import Link from "next/link";
import { loginUser } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Briefcase, Loader2, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Mesh Background */}
      <div className="absolute inset-0 bg-mesh dark:bg-mesh-dark" />
      <div className="absolute inset-0 bg-aurora" />

      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-float-delayed" />

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

      {/* Login Card */}
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
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Sign in to continue tracking your applications
            </p>
          </div>

          {/* Form */}
          <form action={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}

            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="john@example.com"
              required
              autoComplete="email"
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
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
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
