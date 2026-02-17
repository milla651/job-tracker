"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/app/actions/reset-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <div className="text-destructive">Invalid or missing reset token.</div>
                <Link href="/forgot-password" className="text-primary hover:underline block">
                    Request a new link
                </Link>
            </div>
        );
    }

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const result = await resetPassword({ password }, token);
            if (result?.error) {
                setError(result.error);
            } else {
                setSuccess("Password reset successfully! Redirecting...");
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            }
        } catch (e) {
            setError("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
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

            <div className="relative">
                <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    label="New Password"
                    placeholder="••••••••"
                    required
                    disabled={isLoading || !!success}
                    minLength={8}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-muted-foreground hover:text-foreground transition-colors"
                >
                    {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                    ) : (
                        <Eye className="w-4 h-4" />
                    )}
                </button>
            </div>

            <div className="relative">
                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    label="Confirm New Password"
                    placeholder="••••••••"
                    required
                    disabled={isLoading || !!success}
                    minLength={8}
                />
            </div>

            <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300"
                disabled={isLoading || !!success}
                size="lg"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Resetting Password...
                    </>
                ) : (
                    "Reset Password"
                )}
            </Button>
        </form>
    );
}

export default function ResetPasswordPage() {
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

            <div className="relative w-full max-w-md">
                <div className="glass-card p-8 md:p-10">
                    <div className="flex justify-center mb-6">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/10">
                            <KeyRound className="w-8 h-8 text-primary" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 mb-2">
                            Set New Password
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Create a strong password to secure your account.
                        </p>
                    </div>

                    <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
