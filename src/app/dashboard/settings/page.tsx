import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/ProfileForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  if (!user) {
    // Should not happen if session exists, but good safety
    redirect("/login");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden pt-24">
      {/* Background Elements */}
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">
            <span className="text-gradient">Settings</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and profile information.
          </p>
        </div>

        {/* Career profile banner */}
        <Link href="/dashboard/profile" className="block mb-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/60 hover:bg-teal-100 dark:hover:bg-teal-950/50 transition-colors group">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/50">
              <Sparkles className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">Career Profile & AI Settings</p>
              <p className="text-xs text-teal-600 dark:text-teal-400">Target roles, CV, compensation expectations — powers AI job scoring.</p>
            </div>
            <ChevronRight className="h-4 w-4 text-teal-400 group-hover:text-teal-600 transition-colors" />
          </div>
        </Link>

        <div className="glass-card p-8 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span className="p-2 rounded-lg bg-primary/10">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              Account Information
            </h2>
            <ProfileForm initialData={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
