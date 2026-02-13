"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Briefcase, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit code");
            setIsLoading(false);
            return;
        }

        try {
            const result = await verifyEmail(email, otp);
            if (result?.error) {
                setError(result.error);
            } else if (result?.success) {
                setSuccess(true);
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push("/login?verified=true");
                }, 2000);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background Elements - reused from auth pages */}
            <div className="absolute inset-0 bg-mesh dark:bg-mesh-dark" />
            <div className="absolute inset-0 bg-aurora" />
            <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-float-delayed" />
            <div
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />

            <Link
                href="/register"
                className="absolute top-8 left-8 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back
            </Link>

            <div className="relative w-full max-w-md">
                <div className="glass-card p-8 md:p-10">
                    <div className="flex justify-center mb-8">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent">
                            <Briefcase className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Verify your email
                        </h1>
                        <p className="text-muted-foreground">
                            We sent a code to <span className="font-medium text-foreground">{email}</span>
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex justify-center">
                                <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-3">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                                Email Verified!
                            </h3>
                            <p className="text-muted-foreground">
                                Redirecting you to login...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    label="Verification Code"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                                        setOtp(value);
                                    }}
                                    className="text-center text-2xl tracking-widest"
                                    required
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                />
                                <p className="text-xs text-center text-muted-foreground">
                                    Enter the 6-digit code from your email
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg"
                                disabled={isLoading || otp.length !== 6}
                                size="lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify Email"
                                )}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
