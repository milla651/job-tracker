"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail, resendVerificationCode } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Briefcase, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const codeFromUrl = searchParams.get("code");

    // Mask email function
    const maskEmail = (email: string) => {
        if (!email) return "";
        const [local, domain] = email.split("@");
        if (!local || !domain) return email;

        const maskedLocal = local.length > 3 ? `${local.slice(0, 3)}***` : `${local.slice(0, 1)}***`;
        const [domainName, tld] = domain.split(".");
        const maskedDomain = domainName.length > 1 ? `${domainName.slice(0, 1)}**` : `${domainName}**`;

        return `${maskedLocal}@${maskedDomain}.${tld || 'com'}`;
    };

    const [otp, setOtp] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isResendLoading, setIsResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);

    // Countdown timer effect
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    // Auto-fill and verify if code is in URL
    useEffect(() => {
        if (codeFromUrl && codeFromUrl.length === 6 && !success && !isLoading) {
            setOtp(codeFromUrl);
            verifyCode(codeFromUrl);
        }
    }, [codeFromUrl]);

    async function handleResend() {
        if (timeLeft > 0) return;

        setIsResendLoading(true);
        setResendMessage(null);
        try {
            const result = await resendVerificationCode(email);
            if (result.error) {
                setResendMessage({ type: 'error', text: result.error });
            } else {
                setResendMessage({ type: 'success', text: 'New code sent!' });
                setTimeLeft(60); // Start 60s cooldown
            }
        } catch (err) {
            setResendMessage({ type: 'error', text: 'Failed to resend code.' });
        } finally {
            setIsResendLoading(false);
        }
    }



    async function verifyCode(code: string) {
        setIsLoading(true);
        setError(null);

        try {
            const result = await verifyEmail(email, code);
            if (result?.error) {
                setError(result.error);
                setIsLoading(false); // Only stop loading on error
            } else if (result?.success) {
                setSuccess(true);
                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    router.push("/dashboard");
                }, 2000);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit code");
            return;
        }
        await verifyCode(otp);
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
                            We sent a code to <span className="font-medium text-foreground">{maskEmail(email)}</span>
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
                            <p className="text-muted-foreground animate-pulse">
                                Setting up your dashboard...
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
                                        // Auto-submit when 6 digits are entered
                                        if (value.length === 6) {
                                            // We need to call verifyEmail directly or trigger submit
                                            // Since handleSubmit takes an event, let's create a specialized submit function or just modify handleSubmit
                                            // Easier to just let the user click or hit enter? 
                                            // No, requirement is auto-submit.
                                            // We'll trigger verification directly here but we need to handle state.
                                            // Ideally we shouldn't trigger side effects in render/change directly without care.
                                            // Better: useEffect on otp change? Or just call a helper.
                                            verifyCode(value);
                                        }
                                    }}
                                    onPaste={(e) => {
                                        e.preventDefault();
                                        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
                                        setOtp(pastedData);
                                        if (pastedData.length === 6) {
                                            verifyCode(pastedData);
                                        }
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

                            <div className="text-center space-y-4">
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={isResendLoading || isLoading || timeLeft > 0}
                                    className="text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isResendLoading
                                        ? "Sending..."
                                        : timeLeft > 0
                                            ? `Resend available in ${timeLeft}s`
                                            : "Did not receive a code? Resend"}
                                </button>

                                {resendMessage && (
                                    <p className={`text-sm ${resendMessage.type === 'success' ? 'text-emerald-500' : 'text-destructive'}`}>
                                        {resendMessage.text}
                                    </p>
                                )}
                            </div>
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
