"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { newVerification } from "@/app/actions/new-verification";
import Link from "next/link";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function NewVerificationPage() {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const onSubmit = useCallback(() => {
        if (success || error) return;

        if (!token) {
            setError("Missing token!");
            return;
        }

        newVerification(token)
            .then((data) => {
                setSuccess(data.success);
                setError(data.error);
            })
            .catch(() => {
                setError("Something went wrong!");
            });
    }, [token, success, error]);

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
            <div className="w-[400px] shadow-md border rounded-xl overflow-hidden glass p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <h1 className="text-2xl font-semibold mb-2">Confirming your verification</h1>

                    {!success && !error && (
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    )}

                    {success && (
                        <div className="flex flex-col items-center space-y-4">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                            <p className="text-emerald-500 font-medium">{success}</p>
                            <Link href="/login" className="text-primary hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    )}

                    {error && (
                        <div className="flex flex-col items-center space-y-4">
                            <XCircle className="h-10 w-10 text-destructive" />
                            <p className="text-destructive font-medium">{error}</p>
                            <Link href="/login" className="text-primary hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
