import { getWorkExperience, getEducation, getSkills, getProjects } from "@/app/actions/cv-builder";
import { WorkExperienceSection } from "@/components/cv/WorkExperienceSection";
import { EducationSection } from "@/components/cv/EducationSection";
import { SkillsSection } from "@/components/cv/SkillsSection";
import { ProjectsSection } from "@/components/cv/ProjectsSection";
import { FileText } from "lucide-react";

export default async function CVBuilderPage() {
  const [workExp, education, skills, projects] = await Promise.all([
    getWorkExperience(),
    getEducation(),
    getSkills(),
    getProjects(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-3xl font-bold">CV Builder</h1>
        </div>
        <p className="text-muted-foreground">
          Build your master CV once. We'll tailor it for each job application using AI.
        </p>
      </div>

      <div className="space-y-8">
        <WorkExperienceSection initialData={workExp} />
        <EducationSection initialData={education} />
        <SkillsSection initialData={skills} />
        <ProjectsSection initialData={projects} />
      </div>
    </div>
  );
}
