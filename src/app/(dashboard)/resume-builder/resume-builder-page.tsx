"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeForm } from "@/components/resume/resume-form";
import { ResumePreview } from "@/components/resume/resume-preview";
import { ResumeUpload } from "@/components/resume/resume-upload";
import { AIResumeBuilder } from "@/components/resume/ai-resume-builder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Sparkles, Upload, FileText } from "lucide-react";

export default function ResumeBuilderPageClient({ initialResumeData }: { initialResumeData: any }) {
  const [resumeData, setResumeData] = useState<any>(initialResumeData);
  const [activeTab, setActiveTab] = useState("builder");
  const [template, setTemplate] = useState<"modern" | "classic" | "minimal">("modern");

  const handleSave = (data: any) => {
    setResumeData(data);
  };

  const handleGenerateComplete = (data: any) => {
    setResumeData(data);
    setActiveTab("preview");
  };

  const handleDownload = () => {
    if (!resumeData) return;
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
          <p className="text-gray-500">Create ATS-optimized resumes with AI</p>
        </div>
        <div className="flex items-center gap-3">
          {resumeData && (
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download JSON
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Builder
          </TabsTrigger>
          <TabsTrigger value="ai-builder" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Generator
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload & Parse
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Resume Editor</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResumeForm
                    initialData={resumeData || undefined}
                    onSave={handleSave}
                    onGenerateWithAI={async (section, context) => {
                      // AI generation would be called here
                    }}
                  />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {(["modern", "classic", "minimal"] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTemplate(t)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          template === t
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className="font-medium capitalize">{t}</p>
                        <p className="text-xs text-gray-500 mt-1">{t === "modern" ? "Clean & Professional" : t === "classic" ? "Traditional" : "Minimalist"}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai-builder">
          <AIResumeBuilder onGenerateComplete={handleGenerateComplete} />
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload & Parse Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResumeUpload
                onUploadComplete={(text) => console.log("Uploaded:", text)}
                onParseComplete={(data) => {
                  setResumeData(data);
                  setActiveTab("builder");
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          {resumeData ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Live Preview</CardTitle>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-500 mr-2">Template:</label>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value as any)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="minimal">Minimal</option>
                  </select>
                  {resumeData && (
                    <Button onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ResumePreview data={resumeData} template={template} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">No resume data yet. Build or generate a resume first.</p>
                <Button onClick={() => setActiveTab("builder")}>Start Building</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}