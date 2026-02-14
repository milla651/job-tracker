"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateProfile } from "@/app/actions/user";
import { useRouter } from "next/navigation";

// Actually, I should check if sonner/toast is installed. 
// Glancing at package.json earlier, I didn't see sonner. 
// I'll stick to simple state handling for feedback or use `alert` for now, 
// or better, standard react state for success/error messages.

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData: {
    name: string | null;
    email: string;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name || "",
      email: initialData.email,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await updateProfile(data);

      if (result.error) {
        setMessage({ type: "error", text: typeof result.error === "string" ? result.error : "Failed to update profile" });
      } else {
        setMessage({ type: "success", text: "Profile updated successfully" });
        router.refresh();
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">

      {/* Avatar Placeholder */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent p-1 shadow-lg shadow-primary/20">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-2xl font-bold text-primary">
              {initialData.name ? initialData.name.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
          <div className="absolute bottom-0 right-0 p-1.5 bg-background rounded-full border border-border">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{initialData.name || "User"}</h3>
          <p className="text-sm text-muted-foreground">{initialData.email}</p>
        </div>
      </div>

      <div className="space-y-5">
        <Input
          id="name"
          label="Display Name"
          placeholder="How should we call you?"
          error={errors.name?.message}
          {...register("name")}
          className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all hover:bg-background/80"
        />

        <Input
          id="email"
          label="Email Address"
          type="email"
          placeholder="your.email@example.com"
          error={errors.email?.message}
          {...register("email")}
          className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all hover:bg-background/80"
          disabled
        />
        <p className="text-xs text-muted-foreground ml-1">
          Email cannot be changed at this time.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 ${message.type === "success"
              ? "bg-green-500/10 text-green-600 border border-green-500/20"
              : "bg-red-500/10 text-red-600 border border-red-500/20"
            }`}
        >
          {message.type === "success" ? (
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-600 font-bold">!</div>
          )}
          {message.text}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-brand shadow-lg hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 rounded-xl h-12 text-base font-medium"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving Changes...
          </span>
        ) : "Save Changes"}
      </Button>
    </form>
  );
}
