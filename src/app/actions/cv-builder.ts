"use server";

import { auth } from "@/lib/auth";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ── Validation Schemas ───────────────────────────────────────────────────────

const WorkExperienceSchema = z.object({
  company: z.string().min(1, "Company is required"),
  title: z.string().min(1, "Title is required"),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  description: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  order: z.number().optional(),
});

const EducationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  gpa: z.string().optional(),
  honors: z.array(z.string()).optional(),
  activities: z.string().optional(),
  order: z.number().optional(),
});

const SkillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  category: z.string().min(1, "Category is required"),
  proficiency: z.string().optional(),
  yearsOfExperience: z.number().optional(),
  order: z.number().optional(),
});

const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  url: z.string().optional(),
  githubUrl: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  order: z.number().optional(),
});

// ── Work Experience ──────────────────────────────────────────────────────────

export async function getWorkExperience() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const result = await query(
      `SELECT * FROM "WorkExperience" WHERE "userId" = $1 ORDER BY "order", "startDate" DESC`,
      [session.user.id]
    );
    return result;
  } catch {
    return [];
  }
}

export async function createWorkExperience(data: z.infer<typeof WorkExperienceSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = WorkExperienceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await query(
      `INSERT INTO "WorkExperience" 
       ("userId", company, title, location, "startDate", "endDate", "isCurrent", 
        description, achievements, technologies, "order")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        session.user.id,
        parsed.data.company,
        parsed.data.title,
        parsed.data.location || null,
        parsed.data.startDate,
        parsed.data.endDate || null,
        parsed.data.isCurrent || false,
        parsed.data.description || null,
        parsed.data.achievements || [],
        parsed.data.technologies || [],
        parsed.data.order || 0,
      ]
    );

    revalidatePath("/dashboard/profile/cv-builder");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to save work experience" };
  }
}

export async function deleteWorkExperience(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await query(
      `DELETE FROM "WorkExperience" WHERE id = $1 AND "userId" = $2`,
      [id, session.user.id]
    );

    revalidatePath("/dashboard/profile/cv-builder");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete" };
  }
}

// ── Education ────────────────────────────────────────────────────────────────

export async function getEducation() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const result = await query(
      `SELECT * FROM "Education" WHERE "userId" = $1 ORDER BY "order", "endDate" DESC NULLS LAST`,
      [session.user.id]
    );
    return result;
  } catch {
    return [];
  }
}

export async function createEducation(data: z.infer<typeof EducationSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = EducationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await query(
      `INSERT INTO "Education" 
       ("userId", institution, degree, field, "startDate", "endDate", gpa, honors, activities, "order")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        session.user.id,
        parsed.data.institution,
        parsed.data.degree,
        parsed.data.field || null,
        parsed.data.startDate || null,
        parsed.data.endDate || null,
        parsed.data.gpa || null,
        parsed.data.honors || [],
        parsed.data.activities || null,
        parsed.data.order || 0,
      ]
    );

    revalidatePath("/dashboard/profile/cv-builder");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save education" };
  }
}

export async function deleteEducation(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await query(
      `DELETE FROM "Education" WHERE id = $1 AND "userId" = $2`,
      [id, session.user.id]
    );

    revalidatePath("/dashboard/profile/cv-builder");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete" };
  }
}

// ── Skills ───────────────────────────────────────────────────────────────────

export async function getSkills() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const result = await query(
      `SELECT * FROM "Skill" WHERE "userId" = $1 ORDER BY category, "order"`,
      [session.user.id]
    );
    return result;
  } catch {
    return [];
  }
}

export async function createSkill(data: z.infer<typeof SkillSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = SkillSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await query(
      `INSERT INTO "Skill" 
       ("userId", name, category, proficiency, "yearsOfExperience", "order")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        session.user.id,
        parsed.data.name,
        parsed.data.category,
        parsed.data.proficiency || null,
        parsed.data.yearsOfExperience || null,
        parsed.data.order || 0,
      ]
    );

    revalidatePath("/dashboard/profile/cv-builder");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save skill" };
  }
}

export async function deleteSkill(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await query(
      `DELETE FROM "Skill" WHERE id = $1 AND "userId" = $2`,
      [id, session.user.id]
    );

    revalidatePath("/dashboard/profile/cv-builder");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete" };
  }
}

// ── Projects ─────────────────────────────────────────────────────────────────

export async function getProjects() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const result = await query(
      `SELECT * FROM "Project" WHERE "userId" = $1 ORDER BY "order", "startDate" DESC NULLS LAST`,
      [session.user.id]
    );
    return result;
  } catch {
    return [];
  }
}

export async function createProject(data: z.infer<typeof ProjectSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = ProjectSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await query(
      `INSERT INTO "Project" 
       ("userId", name, description, technologies, url, "githubUrl", 
        "startDate", "endDate", highlights, "order")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        session.user.id,
        parsed.data.name,
        parsed.data.description || null,
        parsed.data.technologies || [],
        parsed.data.url || null,
        parsed.data.githubUrl || null,
        parsed.data.startDate || null,
        parsed.data.endDate || null,
        parsed.data.highlights || [],
        parsed.data.order || 0,
      ]
    );

    revalidatePath("/dashboard/profile/cv-builder");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save project" };
  }
}

export async function deleteProject(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await query(
      `DELETE FROM "Project" WHERE id = $1 AND "userId" = $2`,
      [id, session.user.id]
    );

    revalidatePath("/dashboard/profile/cv-builder");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete" };
  }
}
