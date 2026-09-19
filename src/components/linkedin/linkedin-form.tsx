"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, ArrowRight } from "lucide-react";

interface LinkedInFormProps {
  onAnalyze: (data: { profileData: string; targetRoles: string[] }) => void;
  analyzing?: boolean;
}

export function LinkedInForm({ onAnalyze, analyzing }: LinkedInFormProps) {
  const [profileData, setProfileData] = useState("");
  const [targetRoles, setTargetRoles] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!profileData.trim()) {
      setError("Please paste your LinkedIn profile data");
      return;
    }
    if (!targetRoles.trim()) {
      setError("Please enter at least one target role");
      return;
    }

    const roles = targetRoles.split(",").map(r => r.trim()).filter(r => r);
    if (roles.length === 0) {
      setError("Please enter valid target roles");
      return;
    }

    onAnalyze({ profileData, targetRoles: roles });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          LinkedIn Optimizer
        </CardTitle>
        <CardDescription>
          Paste your LinkedIn profile and get AI-powered optimization suggestions
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
            <Label htmlFor="profileData">Your LinkedIn Profile Data *</Label>
            <Textarea
              id="profileData"
              value={profileData}
              onChange={(e) => setProfileData(e.target.value)}
              placeholder="Paste your LinkedIn profile content here (headline, about, experience, skills, education, etc.)"
              rows={10}
              required
            />
            <p className="text-sm text-gray-500">
              Copy and paste your full LinkedIn profile including: Headline, About, Experience, Education, Skills, Certifications
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetRoles">Target Roles (comma separated) *</Label>
            <Input
              id="targetRoles"
              value={targetRoles}
              onChange={(e) => setTargetRoles(e.target.value)}
              placeholder="e.g., Senior Frontend Engineer, Full Stack Developer, React Developer"
              required
            />
            <p className="text-sm text-gray-500">Enter roles you're targeting, separated by commas</p>
          </div>

          <Button type="submit" className="w-full" loading={analyzing}>
            {analyzing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze & Optimize
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}