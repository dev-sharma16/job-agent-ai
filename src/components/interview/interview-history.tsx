"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Clock, Target, TrendingUp, Sparkles, ChevronRight } from "lucide-react";

interface InterviewHistoryItem {
  id: string;
  jobTitle: string;
  companyName: string;
  score: number;
  completedAt: string;
  duration: number; // minutes
  status: "completed" | "in-progress";
}

interface InterviewHistoryProps {
  interviews: InterviewHistoryItem[];
  onStartNew: () => void;
  onViewDetails: (interview: InterviewHistoryItem) => void;
}

export function InterviewHistory({ interviews, onStartNew, onViewDetails }: InterviewHistoryProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-700";
    if (score >= 60) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Interview History</h2>
          <p className="text-gray-500">Track your mock interview progress</p>
        </div>
        <Button onClick={onStartNew} className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          New Interview
        </Button>
      </div>

      {interviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No interviews yet</h3>
            <p className="text-gray-500 mb-4">Start your first mock interview to build your history</p>
            <Button onClick={onStartNew}>
              <Sparkles className="w-4 h-4 mr-2" />
              Start First Interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <Card key={interview.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails(interview)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 truncate">{interview.jobTitle}</h3>
                      <Badge variant="secondary">{interview.companyName}</Badge>
                      <Badge variant={interview.status === "completed" ? "default" : "outline"} className="flex items-center gap-1">
                        {interview.status === "completed" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {interview.status === "completed" ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(interview.duration)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(interview.completedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={cn("text-center p-3 rounded-xl", getScoreBgColor(interview.score))} style={{ minWidth: 80 }}>
                      <div className="text-2xl font-bold text-gray-900">{interview.score}</div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {interviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Interviews" value={interviews.length} icon={<Target className="w-5 h-5" />} />
              <StatCard label="Avg Score" value={Math.round(interviews.reduce((a, b) => a + b.score, 0) / interviews.length)} icon={<Target className="w-5 h-5" />} />
              <StatCard label="Best Score" value={Math.max(...interviews.map(i => i.score))} icon={<TrendingUp className="w-5 h-5" />} />
              <StatCard label="Total Time" value={formatDuration(interviews.reduce((a, b) => a + b.duration, 0))} icon={<Clock className="w-5 h-5" />} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function getScoreBgColor(score: number) {
  if (score >= 80) return "bg-green-100";
  if (score >= 60) return "bg-yellow-100";
  return "bg-red-100";
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <div className="text-primary mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}