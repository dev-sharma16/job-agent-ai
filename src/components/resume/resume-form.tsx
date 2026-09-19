"use client";

import { useState } from "react";
import { ResumeData, PersonalDetails, Experience, Education, Skill, Project, Certification, Achievement, SKILL_CATEGORIES, SKILL_LEVELS } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, GripVertical, Download, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeFormProps {
  initialData?: Partial<ResumeData>;
  onSave: (data: ResumeData) => void;
  onGenerateWithAI?: (section: string, context: any) => Promise<void>;
  generating?: boolean;
}

export function ResumeForm({ initialData, onSave, onGenerateWithAI, generating }: ResumeFormProps) {
  const [data, setData] = useState<ResumeData>({
    ...ResumeForm.getDefaultData(),
    ...initialData,
  });
  const [activeTab, setActiveTab] = useState("personal");

  const tabs = [
    { id: "personal", label: "Personal", icon: "👤" },
    { id: "summary", label: "Summary", icon: "📝" },
    { id: "experience", label: "Experience", icon: "💼" },
    { id: "education", label: "Education", icon: "🎓" },
    { id: "skills", label: "Skills", icon: "🛠️" },
    { id: "projects", label: "Projects", icon: "🚀" },
    { id: "certifications", label: "Certifications", icon: "📜" },
    { id: "achievements", label: "Achievements", icon: "🏆" },
  ];

  const updatePersonalField = (field: string, value: any) => {
    setData(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  };

  const updateArrayItem = <T extends keyof ResumeData>(section: T, index: number, field: string, value: any) => {
    setData(prev => {
      const arr = [...(prev[section] as any[])];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [section]: arr };
    });
  };

  const addArrayItem = <T extends keyof ResumeData>(section: T, newItem: any) => {
    setData(prev => ({ ...prev, [section]: [...(prev[section] as any[]), newItem] }));
  };

  const removeArrayItem = <T extends keyof ResumeData>(section: T, index: number) => {
    setData(prev => ({ ...prev, [section]: (prev[section] as any[]).filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          {tabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs py-2">
              {tab.icon} {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="personal" className="space-y-4 pt-4">
          <PersonalDetailsForm data={data.personal} onChange={updatePersonalField} />
        </TabsContent>

        <TabsContent value="summary" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Professional Summary</Label>
            <Textarea
              id="summary"
              value={data.personal.summary}
              onChange={(e) => updatePersonalField("summary", e.target.value)}
              placeholder="Write a brief professional summary..."
              rows={4}
            />
            {onGenerateWithAI && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onGenerateWithAI("summary", data)}
                disabled={generating}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="experience" className="space-y-4 pt-4">
          <ExperienceForm
            experiences={data.experience}
            onUpdate={(index: number, field: string, value: any) => updateArrayItem("experience", index, field, value)}
            onAdd={() => addArrayItem("experience", { id: crypto.randomUUID(), title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" })}
            onRemove={removeArrayItem}
            onGenerateWithAI={onGenerateWithAI}
            generating={generating}
          />
        </TabsContent>

        <TabsContent value="education" className="space-y-4 pt-4">
          <EducationForm
            educations={data.education}
            onUpdate={(index: number, field: string, value: any) => updateArrayItem("education", index, field, value)}
            onAdd={() => addArrayItem("education", { id: crypto.randomUUID(), degree: "", institution: "", location: "", startDate: "", endDate: "", gpa: "", description: "" })}
            onRemove={removeArrayItem}
          />
        </TabsContent>

        <TabsContent value="skills" className="space-y-4 pt-4">
          <SkillsForm
            skills={data.skills}
            onUpdate={(index: number, field: string, value: any) => updateArrayItem("skills", index, field, value)}
            onAdd={() => addArrayItem("skills", { id: crypto.randomUUID(), name: "", level: "Intermediate", category: "Programming Languages" })}
            onRemove={removeArrayItem}
          />
        </TabsContent>

        <TabsContent value="projects" className="space-y-4 pt-4">
          <ProjectsForm
            projects={data.projects}
            onUpdate={(index: number, field: string, value: any) => updateArrayItem("projects", index, field, value)}
            onAdd={() => addArrayItem("projects", { id: crypto.randomUUID(), name: "", description: "", technologies: [], link: "", startDate: "", endDate: "" })}
            onRemove={removeArrayItem}
          />
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4 pt-4">
          <CertificationsForm
            certifications={data.certifications}
            onUpdate={(index: number, field: string, value: any) => updateArrayItem("certifications", index, field, value)}
            onAdd={() => addArrayItem("certifications", { id: crypto.randomUUID(), name: "", issuer: "", date: "", expiryDate: "", credentialId: "", credentialUrl: "" })}
            onRemove={removeArrayItem}
          />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4 pt-4">
          <AchievementsForm
            achievements={data.achievements}
            onUpdate={(index: number, field: string, value: any) => updateArrayItem("achievements", index, field, value)}
            onAdd={() => addArrayItem("achievements", { id: crypto.randomUUID(), title: "", description: "", date: "" })}
            onRemove={removeArrayItem}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => onSave(data)}>
          Save Draft
        </Button>
        <Button type="submit">
          Save & Generate Preview
        </Button>
      </div>
    </form>
  );
}

function PersonalDetailsForm({ data, onChange }: { data: any; onChange: (field: string, value: any) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" value={data.fullName} onChange={(e) => onChange("fullName", e.target.value)} placeholder="John Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={data.email} onChange={(e) => onChange("email", e.target.value)} placeholder="john@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" value={data.phone} onChange={(e) => onChange("phone", e.target.value)} placeholder="+91 98765 43210" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" value={data.location} onChange={(e) => onChange("location", e.target.value)} placeholder="Bangalore, India" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="linkedin">LinkedIn</Label>
        <Input id="linkedin" value={data.linkedin} onChange={(e) => onChange("linkedin", e.target.value)} placeholder="linkedin.com/in/johndoe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="portfolio">Portfolio / Website</Label>
        <Input id="portfolio" value={data.portfolio} onChange={(e) => onChange("portfolio", e.target.value)} placeholder="https://johndoe.dev" />
      </div>
    </div>
  );
}

function ExperienceForm({ experiences, onUpdate, onAdd, onRemove, onGenerateWithAI, generating }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Work Experience</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Experience
        </Button>
      </div>
      {experiences.map((exp: any, index: number) => (
        <Card key={exp.id} className="relative">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Experience #{index + 1}</CardTitle>
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                <Button type="button" variant="ghost" size="icon" onClick={() => onRemove("experience", index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input value={exp.title} onChange={(e) => onUpdate(index, "title", e.target.value)} placeholder="Senior Software Engineer" />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input value={exp.company} onChange={(e) => onUpdate(index, "company", e.target.value)} placeholder="Google" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={exp.location} onChange={(e) => onUpdate(index, "location", e.target.value)} placeholder="Bangalore, India" />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="month" value={exp.startDate} onChange={(e) => onUpdate(index, "startDate", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="month" value={exp.endDate} onChange={(e) => onUpdate(index, "endDate", e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={exp.current} onChange={(e) => onUpdate(index, "current", e.target.checked)} className="rounded border-gray-300" />
                <span className="text-sm">Currently working here</span>
              </label>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={exp.description}
                onChange={(e) => onUpdate(index, "description", e.target.value)}
                placeholder="Describe your responsibilities and achievements..."
                rows={3}
              />
              {onGenerateWithAI && (
                <Button type="button" variant="outline" size="sm" onClick={() => onGenerateWithAI("experience", { index, experience: exp })} disabled={generating}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Enhance with AI
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {experiences.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <p>No experience added yet</p>
          <Button variant="outline" className="mt-2" onClick={onAdd}>
            Add Your First Experience
          </Button>
        </div>
      )}
    </div>
  );
}

function EducationForm({ educations, onUpdate, onAdd, onRemove }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Education</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Education
        </Button>
      </div>
      {educations.map((edu: any, index: number) => (
        <Card key={edu.id} className="relative">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Education #{index + 1}</CardTitle>
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                <Button type="button" variant="ghost" size="icon" onClick={() => onRemove("education", index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Degree</Label>
                <Input value={edu.degree} onChange={(e) => onUpdate(index, "degree", e.target.value)} placeholder="B.Tech Computer Science" />
              </div>
              <div className="space-y-2">
                <Label>Institution</Label>
                <Input value={edu.institution} onChange={(e) => onUpdate(index, "institution", e.target.value)} placeholder="IIT Bangalore" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={edu.location} onChange={(e) => onUpdate(index, "location", e.target.value)} placeholder="Bangalore, India" />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="month" value={edu.startDate} onChange={(e) => onUpdate(index, "startDate", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="month" value={edu.endDate} onChange={(e) => onUpdate(index, "endDate", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>GPA / Score</Label>
                <Input value={edu.gpa} onChange={(e) => onUpdate(index, "gpa", e.target.value)} placeholder="9.2/10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={edu.description} onChange={(e) => onUpdate(index, "description", e.target.value)} placeholder="Relevant coursework, honors, activities..." rows={2} />
            </div>
          </CardContent>
        </Card>
      ))}
      {educations.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <p>No education added yet</p>
          <Button variant="outline" className="mt-2" onClick={onAdd}>
            Add Your First Education
          </Button>
        </div>
      )}
    </div>
  );
}

function SkillsForm({ skills, onUpdate, onAdd, onRemove }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Skills</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </div>
      {skills.map((skill: any, index: number) => (
        <Card key={skill.id} className="relative">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Skill #{index + 1}</CardTitle>
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                <Button type="button" variant="ghost" size="icon" onClick={() => onRemove("skills", index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Skill Name</Label>
                <Input value={skill.name} onChange={(e) => onUpdate(index, "name", e.target.value)} placeholder="React" />
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={skill.level} onValueChange={(v) => onUpdate(index, "level", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SKILL_LEVELS.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={skill.category} onValueChange={(v) => onUpdate(index, "category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SKILL_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {skills.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <p>No skills added yet</p>
          <Button variant="outline" className="mt-2" onClick={onAdd}>
            Add Your First Skill
          </Button>
        </div>
      )}
    </div>
  );
}

function ProjectsForm({ projects, onUpdate, onAdd, onRemove }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Projects</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>
      {projects.map((project: any, index: number) => (
        <Card key={project.id} className="relative">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Project #{index + 1}</CardTitle>
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                <Button type="button" variant="ghost" size="icon" onClick={() => onRemove("projects", index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input value={project.name} onChange={(e) => onUpdate(index, "name", e.target.value)} placeholder="E-commerce Platform" />
              </div>
              <div className="space-y-2">
                <Label>Link</Label>
                <Input value={project.link} onChange={(e) => onUpdate(index, "link", e.target.value)} placeholder="https://github.com/..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={project.description} onChange={(e) => onUpdate(index, "description", e.target.value)} placeholder="Describe the project..." rows={3} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Technologies (comma separated)</Label>
                <Input value={project.technologies.join(", ")} onChange={(e) => onUpdate(index, "technologies", e.target.value.split(",").map(s => s.trim()))} placeholder="React, Node.js, PostgreSQL" />
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="month" value={project.startDate} onChange={(e) => onUpdate(index, "startDate", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="month" value={project.endDate} onChange={(e) => onUpdate(index, "endDate", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {projects.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <p>No projects added yet</p>
          <Button variant="outline" className="mt-2" onClick={onAdd}>
            Add Your First Project
          </Button>
        </div>
      )}
    </div>
  );
}

function CertificationsForm({ certifications, onUpdate, onAdd, onRemove }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Certifications</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Certification
        </Button>
      </div>
      {certifications.map((cert: any, index: number) => (
        <Card key={cert.id} className="relative">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Certification #{index + 1}</CardTitle>
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                <Button type="button" variant="ghost" size="icon" onClick={() => onRemove("certifications", index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Certification Name</Label>
                <Input value={cert.name} onChange={(e) => onUpdate(index, "name", e.target.value)} placeholder="AWS Solutions Architect" />
              </div>
              <div className="space-y-2">
                <Label>Issuer</Label>
                <Input value={cert.issuer} onChange={(e) => onUpdate(index, "issuer", e.target.value)} placeholder="Amazon Web Services" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Date Obtained</Label>
                <Input type="month" value={cert.date} onChange={(e) => onUpdate(index, "date", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input type="month" value={cert.expiryDate} onChange={(e) => onUpdate(index, "expiryDate", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Credential ID</Label>
                <Input value={cert.credentialId} onChange={(e) => onUpdate(index, "credentialId", e.target.value)} placeholder="ABC123" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Credential URL</Label>
              <Input value={cert.credentialUrl} onChange={(e) => onUpdate(index, "credentialUrl", e.target.value)} placeholder="https://credly.com/..." />
            </div>
          </CardContent>
        </Card>
      ))}
      {certifications.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <p>No certifications added yet</p>
          <Button variant="outline" className="mt-2" onClick={onAdd}>
            Add Your First Certification
          </Button>
        </div>
      )}
    </div>
  );
}

function AchievementsForm({ achievements, onUpdate, onAdd, onRemove }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Achievements</h3>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Achievement
        </Button>
      </div>
      {achievements.map((ach: any, index: number) => (
        <Card key={ach.id} className="relative">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Achievement #{index + 1}</CardTitle>
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                <Button type="button" variant="ghost" size="icon" onClick={() => onRemove("achievements", index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={ach.title} onChange={(e) => onUpdate(index, "title", e.target.value)} placeholder="Hackathon Winner" />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="month" value={ach.date} onChange={(e) => onUpdate(index, "date", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={ach.description} onChange={(e) => onUpdate(index, "description", e.target.value)} placeholder="Describe the achievement..." rows={2} />
            </div>
          </CardContent>
        </Card>
      ))}
      {achievements.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <p>No achievements added yet</p>
          <Button variant="outline" className="mt-2" onClick={onAdd}>
            Add Your First Achievement
          </Button>
        </div>
      )}
    </div>
  );
}

ResumeForm.getDefaultData = () => ({
  personal: { fullName: "", email: "", phone: "", location: "", linkedin: "", portfolio: "", summary: "" },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  achievements: [],
});