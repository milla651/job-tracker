"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Maximum file size: 4MB (to be safe with Vercel/Serverless limits)
const MAX_FILE_SIZE = 4 * 1024 * 1024; 

export async function uploadDocument(jobId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  if (file.size > MAX_FILE_SIZE) {
    return { error: "File size must be less than 4MB" };
  }

  // Verify job ownership
  const job = await prisma.jobApplication.findUnique({
    where: { id: jobId },
  });

  if (!job || job.userId !== session.user.id) {
    return { error: "Job not found or unauthorized" };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    await prisma.document.create({
      data: {
        name: file.name,
        mediaType: file.type,
        size: file.size,
        content: buffer,
        jobApplicationId: jobId,
      },
    });

    revalidatePath(`/dashboard/jobs/${jobId}`);
    return { success: true };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Failed to upload document" };
  }
}

export async function getDocuments(jobId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await prisma.document.findMany({
    where: { 
      jobApplicationId: jobId,
      jobApplication: { userId: session.user.id } // Ensure ownership
    },
    select: {
      id: true,
      name: true,
      size: true,
      mediaType: true,
      createdAt: true,
      // Exclude content for list view performance
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteDocument(docId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  // Check ownership via relation
  const doc = await prisma.document.findFirst({
    where: { 
      id: docId,
      jobApplication: { userId: session.user.id }
    },
    select: { jobApplicationId: true }
  });

  if (!doc) return { error: "Document not found" };

  await prisma.document.delete({
    where: { id: docId },
  });

  revalidatePath(`/dashboard/jobs/${doc.jobApplicationId}`);
  return { success: true };
}

// Special action to retrieve content for download/preview
export async function getDocumentContent(docId: string) {
   const session = await auth();
   if (!session?.user?.id) return null;

   const doc = await prisma.document.findFirst({
     where: { 
       id: docId,
       jobApplication: { userId: session.user.id }
     },
     select: { content: true, mediaType: true, name: true }
   });

   if (!doc) return null;
   
   // Convert Buffer to Base64 to send over Server Action boundary if needed, 
   // or just return plain object if used in route handler.
   // For Server Actions, we need simple serializable types.
   // We will return a Base64 string for the client to display.
   return {
     name: doc.name,
     mediaType: doc.mediaType,
     base64: doc.content.toString('base64')
   };
}
