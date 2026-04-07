"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

// ── Validation schema ─────────────────────────────────────────────────────────

const StorySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  situation: z.string().min(10, "Add more detail to the situation").max(2000),
  task: z.string().min(10, "Add more detail to the task").max(2000),
  action: z.string().min(10, "Add more detail to the action").max(2000),
  result: z.string().min(10, "Add more detail to the result").max(2000),
  reflection: z.string().max(1000).optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
  impact: z.string().max(200).optional(),
});

export type StoryFormData = z.infer<typeof StorySchema>;

// ── Get all stories ───────────────────────────────────────────────────────────

export async function getStories() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    return await prisma.storyBankEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    return [];
  }
}

// ── Get single story ──────────────────────────────────────────────────────────

export async function getStory(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    return await prisma.storyBankEntry.findFirst({
      where: { id, userId: session.user.id },
    });
  } catch {
    return null;
  }
}

// ── Create story ──────────────────────────────────────────────────────────────

export async function createStory(
  data: StoryFormData
): Promise<{ success: boolean; id?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = StorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    const story = await prisma.storyBankEntry.create({
      data: {
        userId: session.user.id,
        ...parsed.data,
        tags: parsed.data.tags ?? [],
      },
    });

    revalidatePath("/dashboard/stories");
    return { success: true, id: story.id };
  } catch {
    return { success: false, error: "Failed to create story" };
  }
}

// ── Update story ──────────────────────────────────────────────────────────────

export async function updateStory(
  id: string,
  data: StoryFormData
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const parsed = StorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    const existing = await prisma.storyBankEntry.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return { success: false, error: "Story not found" };

    await prisma.storyBankEntry.update({
      where: { id },
      data: { ...parsed.data, tags: parsed.data.tags ?? existing.tags },
    });

    revalidatePath("/dashboard/stories");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update story" };
  }
}

// ── Delete story ──────────────────────────────────────────────────────────────

export async function deleteStory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const existing = await prisma.storyBankEntry.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return { success: false, error: "Story not found" };

    await prisma.storyBankEntry.delete({ where: { id } });

    revalidatePath("/dashboard/stories");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete story" };
  }
}
