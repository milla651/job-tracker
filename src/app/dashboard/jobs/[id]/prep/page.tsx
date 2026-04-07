import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getPrepPackage } from "@/app/actions/interview-prep";
import { PrepPageClient } from "./PrepPageClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return { title: "Prep — CareerOS" };

  const job = await prisma.jobApplication.findFirst({
    where: { id, userId: session.user.id },
    select: { company: true, position: true },
  });

  return {
    title: job ? `Prep: ${job.position} @ ${job.company} — CareerOS` : "Prep — CareerOS",
  };
}

export default async function PrepPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const job = await prisma.jobApplication.findFirst({
    where: { id, userId: session.user.id },
    select: {
      id: true,
      company: true,
      position: true,
      description: true,
      status: true,
    },
  });

  if (!job) redirect("/dashboard/tracker");

  const [prepPackage, stories] = await Promise.all([
    getPrepPackage(id),
    prisma.storyBankEntry
      .findMany({ where: { userId: session.user.id } })
      .catch(() => []),
  ]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href={`/dashboard/jobs/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {job.company}
        </Link>

        <PrepPageClient
          job={job}
          initialPrepPackage={prepPackage}
          stories={stories}
        />
      </div>
    </div>
  );
}
