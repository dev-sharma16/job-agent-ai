"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Download, ArrowLeft, Target, TrendingUp, Award, Star, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkedInResultsProps {
  results: {
    headline: string;
    about: string;
    skills: string[];
    experienceSuggestions: { role: string; suggestedBullets: string[] }[];
    keywordGaps: string[];
    profileScore: number;
  };
  onBack: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export function LinkedInResults({ results, onBack, onDownload, onShare }: LinkedInResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700";
    if (score >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Strong Profile";
    if (score >= 60) return "Good Profile";
    if (score >= 40) return "Needs Work";
    return "Weak Profile";
  };

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6 pb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-4">
              <span className="text-4xl font-bold text-primary">{results.profileScore}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Profile Score</h2>
            <Badge className={cn("text-lg px-4 py-2", getScoreColor(results.profileScore))}>
              {getScoreLabel(results.profileScore)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Optimized Headline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Optimized Headline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-gray-900 font-medium">{results.headline}</p>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(results.headline)}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Optimized About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Optimized About Section
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber/20 whitespace-pre-wrap">
            <p className="text-gray-900">{results.about}</p>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(results.about)}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Top Skills to Add ({results.skills.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {results.skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keyword Gaps */}
      {results.keywordGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              Missing Keywords for Target Roles ({results.keywordGaps.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {results.keywordGaps.map((keyword, index) => (
                <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  {keyword}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">Add these keywords to improve searchability for your target roles</p>
          </CardContent>
        </Card>
      )}

      {/* Experience Suggestions */}
      {results.experienceSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Experience Bullet Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.experienceSuggestions.map((exp, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-2">{exp.role}</h4>
                  <ul className="space-y-1 list-disc list-inside text-gray-700">
                    {exp.suggestedBullets.map((bullet, i) => (
                      <li key={i}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={onBack} variant="outline" className="flex-1 min-w-[150px]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Analyze
        </Button>
        <Button variant="outline" onClick={onDownload} className="flex-1 min-w-[150px]">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
        <Button variant="outline" onClick={onShare} className="flex-1 min-w-[150px]">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
}