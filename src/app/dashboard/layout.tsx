import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileBanner } from "@/components/profile/ProfileBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <ProfileBanner />
      {children}
    </>
  );
}
