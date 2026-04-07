import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/actions/profile";
import { ProfileWizard } from "@/components/profile/ProfileWizard";

export const metadata = { title: "Career Profile — CareerOS" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const profile = await getProfile();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
            Career Profile
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm">
            The more you fill in, the more accurate your AI job evaluations become.
          </p>
          {profile && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="h-2 w-32 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
                <div
                  className="h-full bg-teal-500 transition-all duration-500"
                  style={{ width: `${profile.completionPct}%` }}
                />
              </div>
              <span className="text-xs text-stone-500">{profile.completionPct}% complete</span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 shadow-sm">
          <ProfileWizard
            existingProfile={profile}
            onComplete={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
