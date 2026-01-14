"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { createJob, updateJob } from "@/app/actions/jobs";
import { JobApplication, JobStatus } from "@prisma/client";
import { Loader2 } from "lucide-react";

interface JobFormProps {
  job?: JobApplication;
  mode: "create" | "edit";
}

const statusOptions = [
  { value: "WISHLIST", label: "🌟 Wishlist" },
  { value: "APPLIED", label: "📤 Applied" },
  { value: "PHONE_SCREEN", label: "📞 Phone Screen" },
  { value: "INTERVIEW", label: "🎤 Interview" },
  { value: "TECHNICAL", label: "💻 Technical" },
  { value: "OFFER", label: "📋 Offer" },
  { value: "ACCEPTED", label: "🎉 Accepted" },
  { value: "REJECTED", label: "❌ Rejected" },
  { value: "WITHDRAWN", label: "↩️ Withdrawn" },
];

export function JobForm({ job, mode }: JobFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "create") {
        const result = await createJob(formData);
        if (result?.error) {
          setError(result.error);
        }
      } else if (job) {
        const result = await updateJob(job.id, formData);
        if (result?.error) {
          setError(result.error);
        }
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Add New Job Application" : "Edit Job Application"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              id="company"
              name="company"
              label="Company *"
              placeholder="e.g., Google"
              defaultValue={job?.company}
              required
            />
            <Input
              id="position"
              name="position"
              label="Position *"
              placeholder="e.g., Senior Software Engineer"
              defaultValue={job?.position}
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              id="location"
              name="location"
              label="Location"
              placeholder="e.g., San Francisco, CA (Remote)"
              defaultValue={job?.location || ""}
            />
            <Select
              id="status"
              name="status"
              label="Status"
              options={statusOptions}
              defaultValue={job?.status || "APPLIED"}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Input
              id="salaryMin"
              name="salaryMin"
              type="number"
              label="Salary Min"
              placeholder="e.g., 120000"
              defaultValue={job?.salaryMin?.toString() || ""}
            />
            <Input
              id="salaryMax"
              name="salaryMax"
              type="number"
              label="Salary Max"
              placeholder="e.g., 180000"
              defaultValue={job?.salaryMax?.toString() || ""}
            />
          </div>

          <Input
            id="jobUrl"
            name="jobUrl"
            type="url"
            label="Job URL"
            placeholder="https://..."
            defaultValue={job?.jobUrl || ""}
          />

          <Textarea
            id="description"
            name="description"
            label="Job Description"
            placeholder="Paste the job description here..."
            defaultValue={job?.description || ""}
          />

          <Textarea
            id="notes"
            name="notes"
            label="Notes"
            placeholder="Add your personal notes about this opportunity..."
            defaultValue={job?.notes || ""}
          />

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : mode === "create" ? (
                "Add Job"
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
