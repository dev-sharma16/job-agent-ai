"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, ArrowRight, Copy } from "lucide-react";

interface AIResumeBuilderProps {
  onGenerateComplete?: (data: any) => void;
}

export function AIResumeBuilder({ onGenerateComplete }: AIResumeBuilderProps) {
  const [formData, setFormData] = useState({
    targetRole: "",
    jobDescription: "",
    currentTitle: "",
    currentCompany: "",
    yearsExperience: "",
    keySkills: "",
    achievements: "",
    education: "",
  });
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGenerating(true);

    try {
      const response = await fetch("/api/ai/resume-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate resume");
      }

      const result = await response.json();
      setGeneratedContent(result.data);
      onGenerateComplete?.(result.data);
      setActiveStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate resume");
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/resume-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const result = await response.json();
        setGeneratedContent(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate");
    } finally {
      setGenerating(false);
    }
  };

  if (activeStep === 1) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Resume Builder
          </CardTitle>
          <CardDescription>
            Generate a tailored, ATS-optimized resume in seconds using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="targetRole">Target Role *</Label>
              <Input
                id="targetRole"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                placeholder="e.g., Senior Frontend Engineer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobDescription">Job Description (Optional)</Label>
              <Textarea
                id="jobDescription"
                value={formData.jobDescription}
                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                placeholder="Paste the job description here for better tailoring..."
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentTitle">Current Title</Label>
                <Input
                  id="currentTitle"
                  value={formData.currentTitle}
                  onChange={(e) => setFormData({ ...formData, currentTitle: e.target.value })}
                  placeholder="e.g., Software Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentCompany">Current Company</Label>
                <Input
                  id="currentCompany"
                  value={formData.currentCompany}
                  onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                  placeholder="e.g., Google"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="yearsExperience">Years of Experience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: e.target.value })}
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Input
                  id="education"
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="e.g., B.Tech Computer Science, IIT Delhi"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keySkills">Key Skills (comma separated)</Label>
              <Input
                id="keySkills"
                value={formData.keySkills}
                onChange={(e) => setFormData({ ...formData, keySkills: e.target.value })}
                placeholder="React, TypeScript, Node.js, AWS, PostgreSQL"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="achievements">Key Achievements</Label>
              <Textarea
                id="achievements"
                value={formData.achievements}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                placeholder="Led team of 10, reduced latency by 40%, published 3 papers..."
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" loading={generating}>
              {generating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Resume with AI
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Generated Resume</h2>
          <p className="text-gray-500">Review and copy the AI-generated content</p>
        </div>
        <Button variant="outline" onClick={() => setActiveStep(1)}>
          <ArrowRight className="w-4 h-4 mr-2" />
          Edit Inputs
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {generatedContent && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Preview</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2))}>
                <Copy className="w-4 h-4 mr-2" />
                Copy JSON
              </Button>
              <Button variant="outline" size="sm" onClick={handleRegenerate} loading={generating}>
                <Loader2 className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900">{generatedContent.targetRole || formData.targetRole}</h4>
                <p className="text-gray-500">{generatedContent.summary || "Professional summary will appear here"}</p>
              </div>

              {generatedContent.experience && generatedContent.experience.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Experience</h5>
                  <div className="space-y-3">
                    {generatedContent.experience.map((exp: any, i: number) => (
                      <div key={i} className="pl-4 border-l-2 border-primary/20">
                        <p className="font-semibold">{exp.title}</p>
                        <p className="text-primary">{exp.company}</p>
                        <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate || "Present"}</p>
                        <p className="text-gray-700 mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {generatedContent.skills && generatedContent.skills.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.skills.map((skill: any, i: number) => (
                      <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {skill.name} ({skill.level})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {generatedContent.education && generatedContent.education.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Education</h5>
                  <div className="space-y-2">
                    {generatedContent.education.map((edu: any, i: number) => (
                      <div key={i}>
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-gray-500">{edu.institution} • {edu.startDate} - {edu.endDate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {generatedContent.projects && generatedContent.projects.length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Projects</h5>
                  <div className="space-y-2">
                    {generatedContent.projects.map((proj: any, i: number) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{proj.name}</p>
                        <p className="text-sm text-gray-600">{proj.description}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {proj.technologies?.map((tech: string, j: number) => (
                            <span key={j} className="px-2 py-0.5 bg-gray-200 rounded text-xs">{tech}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}