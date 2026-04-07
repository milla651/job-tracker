import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
    select: { completionPct: true },
  }).catch(() => null);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        user={{ name: session.user.name, email: session.user.email }}
        profilePct={profile?.completionPct ?? 0}
      />
      {/* Main content area — offset by sidebar on desktop, full-width on mobile */}
      <div className="flex-1 min-w-0 md:pl-60 pt-14 md:pt-0">
        {children}
      </div>
    </div>
  );
}
