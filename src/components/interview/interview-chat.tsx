"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX, Send, Loader2, X, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "interviewer" | "candidate";
  content: string;
  timestamp: Date;
  isFinal?: boolean;
}

interface InterviewChatProps {
  messages: Message[];
  isListening: boolean;
  isSpeaking: boolean;
  currentQuestion: string;
  onAnswer: (answer: string) => void;
  onEndInterview: () => void;
  onToggleListening: () => void;
  onToggleMute: () => void;
  loading?: boolean;
}

export function InterviewChat({ messages, isListening, isSpeaking, currentQuestion, onAnswer, onEndInterview, onToggleListening, onToggleMute, loading }: InterviewChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Mock Interview</CardTitle>
              <p className="text-sm text-gray-500">AI-powered mock interview session</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isListening ? "default" : "secondary"} className="flex items-center gap-1">
                {isListening ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                {isListening ? "Listening" : "Not Listening"}
              </Badge>
              <Badge variant={isSpeaking ? "default" : "secondary"} className="flex items-center gap-1">
                {isSpeaking ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                {isSpeaking ? "Speaking" : "Muted"}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Current Question */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Interviewer</p>
                <p className="text-lg font-medium text-gray-900">{currentQuestion || "Starting interview..."}</p>
              </div>
              {loading && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversation History */}
      <Card className="flex-1 mb-4 min-h-[300px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[300px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Interview will start here...</p>
              </div>
            ) : (
              <>
                {messages.map((msg, index) => (
                  <div key={index} className={cn("flex gap-3", msg.role === "candidate" ? "flex-row-reverse" : "")}>
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", msg.role === "interviewer" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600")}>
                      {msg.role === "interviewer" ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div className={cn("max-w-[70%] p-3 rounded-lg", msg.role === "interviewer" ? "bg-primary/5 text-gray-900" : "bg-gray-100 text-gray-900")}>
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs text-gray-400 mt-1 text-right">{msg.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Answer Input */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex gap-2">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className="w-12 h-12 rounded-full"
              onClick={onToggleListening}
              disabled={loading}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Type your answer or use voice..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <Button
                variant="outline"
                size="lg"
                className="w-12 h-12 rounded-full"
                onClick={onToggleMute}
              >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* End Interview */}
      {showEndConfirm ? (
        <Card className="border-red-200">
          <CardContent className="p-4 text-center">
            <p className="text-red-600 mb-4">End interview session?</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setShowEndConfirm(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => { onEndInterview(); setShowEndConfirm(false); }}>
                End Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowEndConfirm(true)}>
          <X className="w-4 h-4 mr-2" />
          End Interview Session
        </Button>
      )}
    </div>
  );
}