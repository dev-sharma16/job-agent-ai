"use client";

import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InterviewSetup } from "@/components/interview/interview-setup";
import { InterviewChat } from "@/components/interview/interview-chat";
import { InterviewFeedback } from "@/components/interview/interview-feedback";
import { InterviewHistory } from "@/components/interview/interview-history";
import { JobApplication } from "@/types/job";
import { Sparkles, Loader2, ArrowLeft, Clock, MessageSquare } from "lucide-react";

interface InterviewState {
  phase: "setup" | "chat" | "feedback" | "history";
  interviewId?: string;
  jdFormatted?: any;
  cvFormatted?: any;
  currentQuestion?: string;
  questionIndex: number;
  questions: any[];
  messages: { role: "interviewer" | "candidate"; content: string; timestamp: Date }[];
  isListening: boolean;
  isSpeaking: boolean;
  feedback?: any;
  loading: boolean;
  history: any[];
}

const mockJobs: JobApplication[] = [
  { 
    id: "1", 
    userId: "current-user",
    companyName: "Google", 
    jobTitle: "Senior Frontend Engineer", 
    jobDescription: "Build user-facing features...",
    jobUrl: "",
    location: "Mountain View, CA",
    source: "linkedin",
    stage: "bookmarked",
    priority: "medium",
    isArchived: false,
    isTrashed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: "2", 
    userId: "current-user",
    companyName: "Microsoft", 
    jobTitle: "Full Stack Developer", 
    jobDescription: "Develop scalable services...",
    jobUrl: "",
    location: "Redmond, WA",
    source: "linkedin",
    stage: "bookmarked",
    priority: "medium",
    isArchived: false,
    isTrashed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: "3", 
    userId: "current-user",
    companyName: "Amazon", 
    jobTitle: "Backend Engineer", 
    jobDescription: "Design distributed systems...",
    jobUrl: "",
    location: "Seattle, WA",
    source: "linkedin",
    stage: "bookmarked",
    priority: "medium",
    isArchived: false,
    isTrashed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function PracticeInterviewPage() {
  const [state, setState] = useState<InterviewState>({
    phase: "setup",
    questionIndex: 0,
    questions: [],
    messages: [],
    isListening: false,
    isSpeaking: false,
    loading: false,
    history: [],
  });

  const handleFormatJDAndCV = async (jdText: string, cvText: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const response = await fetch("/api/interview/format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText, cvText }),
      });
      const data = await response.json();
      if (data.success) {
        setState(prev => ({ ...prev, jdFormatted: data.formattedJD, cvFormatted: data.formattedCV, loading: false }));
        return true;
      }
      throw new Error(data.error);
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      return false;
    }
  };

  const handleStartInterview = async (data: { jdText: string; cvText: string; jobId?: string; intro: string }) => {
    const formatted = await handleFormatJDAndCV(data.jdText, data.cvText);
    if (!formatted) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdFormatted: state.jdFormatted,
          cvFormatted: state.cvFormatted,
          intro: data.intro,
          jobId: data.jobId,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setState(prev => ({
          ...prev,
          phase: "chat",
          interviewId: result.interviewId,
          currentQuestion: result.question,
          questions: result.questions,
          questionIndex: 0,
          messages: [{ role: "interviewer", content: result.question, timestamp: new Date() }],
          loading: false,
        }));
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleAnswer = useCallback(async (answer: string) => {
    if (!state.interviewId || state.loading) return;

    setState(prev => ({ ...prev, loading: true }));

    // Add candidate message
    const newMessages = [...state.messages, { role: "candidate" as const, content: answer, timestamp: new Date() }];
    setState(prev => ({ ...prev, messages: newMessages, loading: false }));

    // Check if this was the last question
    if (state.questionIndex >= state.questions.length - 1) {
      // End interview
      handleEndInterview(answer);
      return;
    }

    // Get followup question
    try {
      const response = await fetch("/api/interview/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: state.interviewId,
          history: newMessages,
          candidateResponse: answer,
          questionIndex: state.questionIndex,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setState(prev => ({
          ...prev,
          questionIndex: prev.questionIndex + 1,
          currentQuestion: result.question,
          messages: [...newMessages, { role: "interviewer", content: result.question, timestamp: new Date() }],
        }));
      }
    } catch (error) {
      console.error("Followup error:", error);
    }
  }, [state.interviewId, state.messages, state.questionIndex, state.questions]);

  const handleEndInterview = async (finalAnswer?: string) => {
    if (!state.interviewId) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch("/api/interview/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: state.interviewId,
          history: state.messages,
          candidateResponse: finalAnswer,
        }),
      });
      const result = await response.json();
      if (result.success) {
        // Add to history
        const newHistoryItem = {
          id: state.interviewId,
          jobTitle: "Mock Interview",
          companyName: "Practice",
          score: result.score,
          completedAt: new Date().toISOString(),
          duration: 15,
          status: "completed" as const,
        };
        setState(prev => ({
          ...prev,
          phase: "feedback",
          feedback: result,
          loading: false,
          history: [newHistoryItem, ...prev.history],
        }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleRetry = () => {
    setState(prev => ({
      ...prev,
      phase: "setup",
      interviewId: undefined,
      jdFormatted: undefined,
      cvFormatted: undefined,
      currentQuestion: undefined,
      questionIndex: 0,
      questions: [],
      messages: [],
      isListening: false,
      isSpeaking: false,
      feedback: undefined,
    }));
  };

  const handleDownload = () => {
    if (!state.feedback) return;
    const blob = new Blob([JSON.stringify(state.feedback, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-feedback-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (!state.feedback) return;
    if (navigator.share) {
      navigator.share({
        title: "Interview Feedback",
        text: `My interview score: ${state.feedback.score}/100`,
      });
    } else {
      navigator.clipboard.writeText(`Interview Score: ${state.feedback.score}/100`);
    }
  };

  const handleViewDetails = (interview: any) => {
    // Navigate to detail view
    console.log("View details:", interview);
  };

  const handleStartNew = () => {
    setState(prev => ({ ...prev, phase: "setup" }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Practice Interview</h1>
          <p className="text-gray-500">AI-powered mock interviews with real-time feedback</p>
        </div>
      </div>

      <Tabs value={state.phase} onValueChange={(v) => setState(prev => ({ ...prev, phase: v as any }))} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Setup
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2" disabled={state.phase !== "chat" && state.phase !== "feedback"}>
            <MessageSquare className="w-4 h-4" />
            Interview
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2" disabled={state.phase !== "feedback"}>
            Feedback
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <InterviewSetup
            jobs={mockJobs}
            onStart={handleStartInterview}
          />
        </TabsContent>

        <TabsContent value="chat">
          {state.phase === "chat" && (
            <InterviewChat
              messages={state.messages}
              isListening={state.isListening}
              isSpeaking={state.isSpeaking}
              currentQuestion={state.currentQuestion || ""}
              onAnswer={handleAnswer}
              onEndInterview={handleEndInterview}
              onToggleListening={() => setState(prev => ({ ...prev, isListening: !prev.isListening }))}
              onToggleMute={() => setState(prev => ({ ...prev, isSpeaking: !prev.isSpeaking }))}
              loading={state.loading}
            />
          )}
        </TabsContent>

        <TabsContent value="feedback">
          {state.feedback && (
            <InterviewFeedback
              feedback={state.feedback}
              onRetry={handleRetry}
              onDownload={handleDownload}
              onShare={handleShare}
            />
          )}
        </TabsContent>

        <TabsContent value="history">
          <InterviewHistory
            interviews={state.history}
            onStartNew={handleStartNew}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}