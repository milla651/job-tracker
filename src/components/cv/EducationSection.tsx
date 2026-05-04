"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import { createEducation, deleteEducation } from "@/app/actions/cv-builder";
import { toast } from "sonner";

export function EducationSection({ initialData }: { initialData: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [field, setField] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [gpa, setGpa] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await createEducation({
      institution,
      degree,
      field,
      startDate,
      endDate,
      gpa,
    });

    if (result.success) {
      toast.success("Education added");
      setShowForm(false);
      setInstitution("");
      setDegree("");
      setField("");
      setStartDate("");
      setEndDate("");
      setGpa("");
    } else {
      toast.error(result.error || "Failed to add");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteEducation(id);
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
          <GraduationCap className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Education</h2>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </div>

      <div className="space-y-4 mb-4">
        {initialData.map((edu: any) => (
          <div key={edu.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{edu.degree} {edu.field && `in ${edu.field}`}</h3>
                <p className="text-sm text-muted-foreground">{edu.institution}</p>
                <p className="text-sm text-muted-foreground">
                  {edu.startDate && new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : "Present"}
                </p>
                {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(edu.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
          <Input
            placeholder="Institution *"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Degree *"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              required
            />
            <Input
              placeholder="Field of Study"
              value={field}
              onChange={(e) => setField(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm">Start Year</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm">End Year</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Input
              placeholder="GPA (optional)"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
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
