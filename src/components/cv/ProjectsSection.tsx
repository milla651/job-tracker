"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Plus, Trash2, Rocket } from "lucide-react";
import { createProject, deleteProject } from "@/app/actions/cv-builder";
import { toast } from "sonner";

export function ProjectsSection({ initialData }: { initialData: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [url, setUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await createProject({
      name,
      description,
      technologies: technologies.split(",").map(t => t.trim()).filter(Boolean),
      url,
      githubUrl,
    });

    if (result.success) {
      toast.success("Project added");
      setShowForm(false);
      setName("");
      setDescription("");
      setTechnologies("");
      setUrl("");
      setGithubUrl("");
    } else {
      toast.error(result.error || "Failed to add");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteProject(id);
    if (result.success) {
      toast.success("Deleted");
    } else {
      toast.error(result.error || "Failed to delete");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Projects</h2>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      <div className="space-y-4 mb-4">
        {initialData.map((project: any) => (
          <div key={project.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold">{project.name}</h3>
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                )}
                {project.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.technologies.map((tech: string, idx: number) => (
                      <span key={idx} className="text-xs bg-secondary px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 mt-2 text-sm">
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Live Demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      GitHub
                    </a>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
          <Input
            placeholder="Project name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <Input
            placeholder="Technologies (comma-separated)"
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Live URL"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Input
              placeholder="GitHub URL"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
