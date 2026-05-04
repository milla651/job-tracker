"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:5000";
const BACKEND_SECRET = process.env.BACKEND_SECRET || "shared-secret";

/**
 * Generate tailored CV for a job application
 */
export async function generateTailoredCV(jobApplicationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/cv/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Backend-Secret": BACKEND_SECRET,
      },
      body: JSON.stringify({
        userId: session.user.id,
        jobApplicationId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || "Failed to generate CV" };
    }

    const data = await response.json();
    
    return {
      success: true,
      taskId: data.taskId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * Check status of CV generation task
 */
export async function checkCVGenerationStatus(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/cv/task/${taskId}`, {
      headers: {
        "X-Backend-Secret": BACKEND_SECRET,
      },
    });

    if (!response.ok) {
      return { success: false, error: "Failed to check status" };
    }

    const data = await response.json();
    
    // If completed, revalidate job page to show new document
    if (data.status === "success" || data.status === "completed") {
      revalidatePath("/dashboard/jobs");
    }
    
    return {
      success: true,
      status: data.status,
      progress: data.progress || 0,
      message: data.message,
      result: data.result,
      error: data.error,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * Extract text from uploaded PDF CV
 */
export async function extractCVFromPDF(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Add userId to formData
    formData.append("userId", session.user.id);

    const response = await fetch(`${PYTHON_BACKEND_URL}/api/cv/extract-pdf`, {
      method: "POST",
      headers: {
        "X-Backend-Secret": BACKEND_SECRET,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || "Failed to extract PDF" };
    }

    const data = await response.json();
    
    return {
      success: true,
      taskId: data.taskId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
