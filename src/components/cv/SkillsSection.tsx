"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Plus, Trash2, Code } from "lucide-react";
import { createSkill, deleteSkill } from "@/app/actions/cv-builder";
import { toast } from "sonner";

const SKILL_CATEGORIES = ["Language", "Framework", "Tool", "Database", "Cloud", "Soft"];

export function SkillsSection({ initialData }: { initialData: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Language");
  const [proficiency, setProficiency] = useState("");
  const [years, setYears] = useState<number | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await createSkill({
      name,
      category,
      proficiency,
      yearsOfExperience: years,
    });

    if (result.success) {
      toast.success("Skill added");
      setShowForm(false);
      setName("");
      setCategory("Language");
      setProficiency("");
      setYears(undefined);
    } else {
      toast.error(result.error || "Failed to add");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteSkill(id);
    if (result.success) {
      toast.success("Deleted");
    } else {
      toast.error(result.error || "Failed to delete");
    }
  };

  // Group skills by category
  const skillsByCategory = initialData.reduce((acc: any, skill: any) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Skills</h2>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      <div className="space-y-4 mb-4">
        {Object.entries(skillsByCategory).map(([cat, skills]: [string, any]) => (
          <div key={cat}>
            <h3 className="font-semibold text-sm mb-2">{cat}</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: any) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full"
                >
                  <span className="text-sm">
                    {skill.name}
                    {skill.yearsOfExperience && ` (${skill.yearsOfExperience}y)`}
                  </span>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Skill name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={SKILL_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Proficiency (e.g., Advanced)"
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Years of experience"
              value={years || ""}
              onChange={(e) => setYears(e.target.value ? parseInt(e.target.value) : undefined)}
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
