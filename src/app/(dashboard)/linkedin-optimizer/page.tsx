"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LinkedInForm } from "@/components/linkedin/linkedin-form";
import { LinkedInResults } from "@/components/linkedin/linkedin-results";
import { Sparkles, FileText } from "lucide-react";

export default function LinkedInOptimizerPage() {
  const [phase, setPhase] = useState("analyze");
  const [results, setResults] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async (data: { profileData: string; targetRoles: string[] }) => {
    setAnalyzing(true);
    try {
      const response = await fetch("/api/linkedin/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        setResults(result.data);
        setPhase("results");
      }
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownload = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `linkedin-optimization-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (!results) return;
    if (navigator.share) {
      navigator.share({
        title: "LinkedIn Optimization",
        text: `My LinkedIn profile score: ${results.profileScore}/100`,
      });
    } else {
      navigator.clipboard.writeText(`LinkedIn Profile Score: ${results.profileScore}/100`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LinkedIn Optimizer</h1>
          <p className="text-gray-500">Optimize your LinkedIn profile with AI suggestions</p>
        </div>
      </div>

      <Tabs value={phase} onValueChange={setPhase} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Analyze Profile
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2" disabled={!results}>
            <Sparkles className="w-4 h-4" />
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyze">
          <LinkedInForm onAnalyze={handleAnalyze} analyzing={analyzing} />
        </TabsContent>

        <TabsContent value="results">
          {results ? (
            <LinkedInResults
              results={results}
              onBack={() => setPhase("analyze")}
              onDownload={handleDownload}
              onShare={handleShare}
            />
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">No results yet. Analyze your profile first.</p>
                <Button onClick={() => setPhase("analyze")}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}