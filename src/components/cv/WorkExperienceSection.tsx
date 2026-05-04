"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Plus, Trash2, Briefcase } from "lucide-react";
import { createWorkExperience, deleteWorkExperience } from "@/app/actions/cv-builder";
import { toast } from "sonner";

interface WorkExperienceData {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements: string[];
  technologies: string[];
}

export function WorkExperienceSection({ initialData }: { initialData: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState("");
  const [achievements, setAchievements] = useState("");
  const [technologies, setTechnologies] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await createWorkExperience({
      company,
      title,
      location,
      startDate,
      endDate: isCurrent ? undefined : endDate,
      isCurrent,
      description,
      achievements: achievements.split("\n").filter(Boolean),
      technologies: technologies.split(",").map(t => t.trim()).filter(Boolean),
    });

    if (result.success) {
      toast.success("Work experience added");
      setShowForm(false);
      // Reset form
      setCompany("");
      setTitle("");
      setLocation("");
      setStartDate("");
      setEndDate("");
      setIsCurrent(false);
      setDescription("");
      setAchievements("");
      setTechnologies("");
    } else {
      toast.error(result.error || "Failed to add");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteWorkExperience(id);
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
          <Briefcase className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Work Experience</h2>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </div>

      {/* List existing experiences */}
      <div className="space-y-4 mb-4">
        {initialData.map((exp: any) => (
          <div key={exp.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{exp.title}</h3>
                <p className="text-sm text-muted-foreground">{exp.company} • {exp.location}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(exp.startDate).toLocaleDateString()} - {exp.isCurrent ? "Present" : (exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "N/A")}
                </p>
                {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
                {exp.achievements?.length > 0 && (
                  <ul className="list-disc list-inside text-sm mt-2">
                    {exp.achievements.map((achievement: string, idx: number) => (
                      <li key={idx}>{achievement}</li>
                    ))}
                  </ul>
                )}
                {exp.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {exp.technologies.map((tech: string, idx: number) => (
                      <span key={idx} className="text-xs bg-secondary px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(exp.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Company *"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
            <Input
              placeholder="Job Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Start Date *</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isCurrent}
              />
              <label className="flex items-center gap-2 text-sm mt-1">
                <input
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                />
                Current position
              </label>
            </div>
          </div>

          <Textarea
            placeholder="Brief description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <Textarea
            placeholder="Achievements (one per line)"
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
            rows={4}
          />

          <Input
            placeholder="Technologies (comma-separated)"
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
          />

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
