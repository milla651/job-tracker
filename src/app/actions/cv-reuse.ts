"use server";

import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:5000";
const BACKEND_SECRET = process.env.BACKEND_SECRET || "shared-secret";

/**
 * Get similar CVs for a job application
 */
export async function getSimilarCVs(jobApplicationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated", similar: [] };
  }

  try {
    const response = await fetch(
      `${PYTHON_BACKEND_URL}/api/cv/similar/${jobApplicationId}`,
      {
        headers: {
          "X-Backend-Secret": BACKEND_SECRET,
        },
      }
    );

    if (!response.ok) {
      return { success: false, error: "Failed to fetch", similar: [] };
    }

    const data = await response.json();
    return { success: true, similar: data.similar || [] };
  } catch (error) {
    return { success: false, error: "Network error", similar: [] };
  }
}

/**
 * Reuse an existing CV for a new job application
 */
export async function reuseCVForJob(sourceDocumentId: string, targetJobId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get source document file path
    const sourceDoc = await query(
      `SELECT d.content, d.name, d.size, ja."userId"
       FROM "Document" d
       JOIN "JobApplication" ja ON d."jobApplicationId" = ja.id
       WHERE d.id = $1`,
      [sourceDocumentId]
    );

    if (!sourceDoc || sourceDoc.length === 0) {
      return { success: false, error: "Source document not found" };
    }

    const filePath = sourceDoc[0].content.toString();
    const fileName = sourceDoc[0].name;
    const fileSize = sourceDoc[0].size;
    const ownerId = sourceDoc[0].userId;

    // Verify ownership
    if (ownerId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify target job belongs to user
    const targetJob = await query(
      `SELECT "userId", company FROM "JobApplication" WHERE id = $1`,
      [targetJobId]
    );

    if (!targetJob || targetJob.length === 0 || targetJob[0].userId !== session.user.id) {
      return { success: false, error: "Target job not found" };
    }

    const targetCompany = targetJob[0].company;

    // Create new document record pointing to same file
    // OR copy the file (better for future modifications)
    const newFileName = `CV_${targetCompany.replace(/\s+/g, "_")}_reused.pdf`;
    
    await query(
      `INSERT INTO "Document" (name, "mediaType", content, size, "jobApplicationId", "createdAt")
       VALUES ($1, 'application/pdf', $2, $3, $4, CURRENT_TIMESTAMP)`,
      [newFileName, filePath, fileSize, targetJobId]
    );

    revalidatePath(`/dashboard/jobs/${targetJobId}`);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * List all user CVs grouped by position
 */
export async function listUserCVsByPosition() {
  const session = await auth();
  if (!session?.user?.id) return {};

  try {
    const cvs = await query(
      `SELECT d.id, d.name, d.size, d."createdAt", d.content,
              ja.company, ja.position, ja.id as "jobId"
       FROM "Document" d
       JOIN "JobApplication" ja ON d."jobApplicationId" = ja.id
       WHERE ja."userId" = $1 AND d."mediaType" = 'application/pdf'
       ORDER BY d."createdAt" DESC`,
      [session.user.id]
    );

    // Group by position
    const grouped: Record<string, any[]> = {};
    
    for (const cv of cvs) {
      const position = cv.position || "Uncategorized";
      if (!grouped[position]) {
        grouped[position] = [];
      }
      grouped[position].push({
        id: cv.id,
        name: cv.name,
        size: cv.size,
        createdAt: cv.createdAt,
        company: cv.company,
        jobId: cv.jobId,
        filePath: cv.content?.toString(),
      });
    }

    return grouped;
  } catch {
    return {};
  }
}

/**
 * Get CV download URL (for backend-served files)
 */
export async function getCVDownloadUrl(documentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Verify ownership
    const doc = await query(
      `SELECT d.id, ja."userId"
       FROM "Document" d
       JOIN "JobApplication" ja ON d."jobApplicationId" = ja.id
       WHERE d.id = $1`,
      [documentId]
    );

    if (!doc || doc.length === 0 || doc[0].userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const url = `${PYTHON_BACKEND_URL}/api/files/cv/${documentId}`;
    
    return { success: true, url };
  } catch (error) {
    return { success: false, error: "Failed to get URL" };
  }
}

/**
 * Delete CV file and database record
 */
export async function deleteCV(documentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Verify ownership and get file path
    const doc = await query(
      `SELECT d.content, ja."userId"
       FROM "Document" d
       JOIN "JobApplication" ja ON d."jobApplicationId" = ja.id
       WHERE d.id = $1`,
      [documentId]
    );

    if (!doc || doc.length === 0 || doc[0].userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    const filePath = doc[0].content?.toString();

    // Delete from database
    await query(`DELETE FROM "Document" WHERE id = $1`, [documentId]);

    // Note: File deletion handled by backend cleanup job
    // We could call Python backend to delete file immediately if needed

    revalidatePath("/dashboard/cv-library");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete" };
  }
}
