"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { JobApplication } from "@/types/job";

interface InterviewSetupProps {
  jobs: JobApplication[];
  onStart: (data: { jdText: string; cvText: string; jobId?: string; intro: string }) => void;
}

export function InterviewSetup({ jobs, onStart }: InterviewSetupProps) {
  const [activeTab, setActiveTab] = useState("manual");
  const [jdText, setJdText] = useState("");
  const [cvText, setCvText] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [intro, setIntro] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!jdText.trim()) {
      setError("Job description is required");
      return;
    }
    if (!cvText.trim()) {
      setError("Resume/CV is required");
      return;
    }
    if (!intro.trim()) {
      setError("Introduction is required");
      return;
    }

    onStart({ jdText, cvText, jobId: selectedJobId || undefined, intro });
  };

  const handleJobSelect = (job: JobApplication) => {
    setSelectedJobId(job.id);
    setJdText(job.jobDescription || "");
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Interview Setup
        </CardTitle>
        <CardDescription>
          Provide the job description and your resume to start a personalized mock interview
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Job Selection */}
          {jobs.length > 0 && (
            <div className="space-y-2">
              <Label>Select a Tracked Job (Optional)</Label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a job from your tracker..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Manual entry</SelectItem>
                  {jobs.map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.companyName} - {job.jobTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedJobId && (
                <Button type="button" variant="outline" size="sm" onClick={() => handleJobSelect(jobs.find(j => j.id === selectedJobId)!)}>
                  Use this job's description
                </Button>
              )}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="upload">Upload Files</TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jdText">Job Description *</Label>
                  <Textarea
                    id="jdText"
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={8}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvText">Your Resume/CV *</Label>
                  <Textarea
                    id="cvText"
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    placeholder="Paste your resume text here (or upload a file in the Upload tab)..."
                    rows={8}
                    required
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upload">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Job Description File</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Upload JD (PDF, DOCX, TXT)</p>
                    <input type="file" accept=".pdf,.docx,.txt" className="hidden" id="jd-upload" />
                    <Button variant="outline" className="mt-2" onClick={() => document.getElementById('jd-upload')?.click()}>
                      Browse
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Resume/CV File</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Upload Resume (PDF, DOCX, TXT)</p>
                    <input type="file" accept=".pdf,.docx,.txt" className="hidden" id="cv-upload" />
                    <Button variant="outline" className="mt-2" onClick={() => document.getElementById('cv-upload')?.click()}>
                      Browse
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Introduction */}
          <div className="space-y-2">
            <Label htmlFor="intro">Your Introduction *</Label>
            <Textarea
              id="intro"
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="Tell me about yourself - this will be your opening answer..."
              rows={3}
              required
            />
            <p className="text-sm text-gray-500">
              This will be your answer to "Tell me about yourself" - keep it concise and relevant to the role.
            </p>
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            <ArrowRight className="w-4 h-4 mr-2" />
            Start Interview
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}