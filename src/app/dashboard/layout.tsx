import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

const getProfilePct = unstable_cache(
  async (userId: string) => {
    const profile = await db.userProfile
      .findUnique({ where: { userId }, select: { completionPct: true } })
      .catch(() => null);
    return profile?.completionPct ?? 0;
  },
  ["sidebar-profile-pct"],
  { revalidate: 30 }
);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  // Session exists but is missing the user ID — broken JWT from before the id
  // callback was hardened. Clear all auth cookies to avoid a /login ↔ /dashboard
  // redirect loop caused by Auth.js auto-redirecting authenticated users.
  if (!session.user?.id) redirect("/api/force-signout");

  const profilePct = await getProfilePct(session.user.id);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        user={{ name: session.user.name, email: session.user.email }}
        profilePct={profilePct}
      />
      {/* Main content area — offset by sidebar on desktop, full-width on mobile */}
      <div className="flex-1 min-w-0 md:pl-60 pt-14 md:pt-0">
        {children}
      </div>
    </div>
  );
}
