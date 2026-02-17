"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/reset-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const email = formData.get("email") as string;

        try {
            const result = await requestPasswordReset({ email });
            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(result.success || "Reset link sent if email exists.");
            }
        } catch (e) {
            setError("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden text-foreground">
            {/* Animated Mesh Background */}
            <div className="absolute inset-0 bg-mesh dark:bg-mesh-dark" />
            <div className="absolute inset-0 bg-aurora" />

            {/* Grid Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Back to Login Link */}
            <Link
                href="/login"
                className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group z-10"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Login
            </Link>

            <div className="relative w-full max-w-md">
                <div className="glass-card p-8 md:p-10">
                    <div className="flex justify-center mb-6">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/10">
                            <Mail className="w-8 h-8 text-primary" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 mb-2">
                            Forgot Password?
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Enter your email and we'll send you a link to reset your password.
                        </p>
                    </div>

                    <form action={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm text-center">
                                {success}
                            </div>
                        )}

                        <Input
                            id="email"
                            name="email"
                            type="email"
                            label="Email Address"
                            placeholder="john@example.com"
                            required
                            autoComplete="email"
                            disabled={isLoading || !!success}
                        />

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300"
                            disabled={isLoading || !!success}
                            size="lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending Link...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
