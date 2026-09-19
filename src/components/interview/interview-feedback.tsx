"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2, Sparkles, Target, TrendingUp, Award } from "lucide-react";

interface InterviewFeedbackProps {
  feedback: {
    score: number;
    strengths: string[];
    improvements: string[];
    specificExamples: string[];
    nextSteps: string[];
    detailedFeedback: string;
  };
  onRetry: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export function InterviewFeedback({ feedback, onRetry, onDownload, onShare }: InterviewFeedbackProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700";
    if (score >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Improvement";
    return "Poor";
  };

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6 pb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mb-4">
              <span className="text-4xl font-bold text-primary">{feedback.score}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Overall Score</h2>
            <Badge className={cn("text-lg px-4 py-2", getScoreColor(feedback.score))}>
              {getScoreLabel(feedback.score)}
            </Badge>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              {feedback.detailedFeedback}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-500" />
            Strengths ({feedback.strengths.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {feedback.strengths.map((strength, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-900">{strength}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            Areas for Improvement ({feedback.improvements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {feedback.improvements.map((improvement, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <Target className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-900">{improvement}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Specific Examples */}
      {feedback.specificExamples.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              Specific Examples from Your Answers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feedback.specificExamples.map((example, index) => (
                <div key={index} className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <p className="text-gray-900">{example}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Recommended Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {feedback.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <p className="text-gray-900">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={onRetry} className="flex-1 min-w-[150px]">
          <Sparkles className="w-4 h-4 mr-2" />
          Retry Interview
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

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}