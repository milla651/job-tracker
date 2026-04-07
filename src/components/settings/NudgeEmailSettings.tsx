"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleNudgeEmails, sendMyNudgeDigest } from "@/app/actions/nudge-email";
import { Bell, BellOff, Send, Loader2, Check } from "lucide-react";

interface NudgeEmailSettingsProps {
  enabled: boolean;
}

export function NudgeEmailSettings({ enabled: initialEnabled }: NudgeEmailSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();
  const [testSent, setTestSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    setError(null);
    startTransition(async () => {
      const res = await toggleNudgeEmails(next);
      if (!res.success) {
        setEnabled(!next);
        setError(res.error ?? "Failed to update");
      }
    });
  }

  function handleTestSend() {
    setError(null);
    setTestSent(false);
    startTransition(async () => {
      const res = await sendMyNudgeDigest();
      if (res.success) {
        setTestSent(true);
        setTimeout(() => setTestSent(false), 4000);
      } else {
        setError(res.error ?? "Failed to send");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border border-border/50">
        <div className="flex items-center gap-3">
          {enabled ? (
            <Bell className="w-5 h-5 text-teal-500" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-semibold text-foreground">Weekly nudge emails</p>
            <p className="text-xs text-muted-foreground">
              {enabled
                ? "You'll receive a weekly digest of stale applications and follow-up reminders."
                : "Nudge emails are off. You won't receive any reminders."}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            enabled ? "bg-teal-500" : "bg-stone-300 dark:bg-stone-700"
          }`}
          aria-label={enabled ? "Disable nudge emails" : "Enable nudge emails"}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestSend}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
            ) : testSent ? (
              <Check className="w-3 h-3 mr-2 text-teal-500" />
            ) : (
              <Send className="w-3 h-3 mr-2" />
            )}
            {testSent ? "Sent!" : "Send digest now"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Test by sending your current nudge digest to your email.
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  );
}
