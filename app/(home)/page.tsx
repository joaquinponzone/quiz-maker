"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { quizCache, LastGeneratedQuiz } from "@/lib/quiz-cache";
import Quiz from "@/components/quiz";
import GenerationLimit from "@/components/generation-limit";
import LastQuizPrompt from "@/components/last-quiz-prompt";
import LoadingScreen from "@/components/loading-screen";
import QuizGenerator from "@/components/quiz-generator";

export default function ChatWithFiles() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [title, setTitle] = useState<string>("");
  const [lastQuiz, setLastQuiz] = useState<LastGeneratedQuiz | null>(null);
  const [isCheckingLastQuiz, setIsCheckingLastQuiz] = useState(true);
  const [generationCount, setGenerationCount] = useState(0);
  const [remainingGenerations, setRemainingGenerations] = useState(100);
  const [isCheckingLimit, setIsCheckingLimit] = useState(true);

  // Check for last generated quiz and generation count on page load
  useEffect(() => {
    const checkInitialData = async () => {
      try {
        // Check last quiz
        const savedQuiz = await quizCache.getLastGeneratedQuiz();
        if (savedQuiz) {
          setLastQuiz(savedQuiz);
        }

        // Check generation count
        const count = await quizCache.getQuizCount();
        const remaining = await quizCache.getRemainingGenerations();
        setGenerationCount(count);
        setRemainingGenerations(remaining);
      } catch (error) {
        console.error("Error checking initial data:", error);
      } finally {
        setIsCheckingLastQuiz(false);
        setIsCheckingLimit(false);
      }
    };

    checkInitialData();
  }, []);

  const clearPDF = () => {
    setQuestions([]);
    setTitle("");
    // Also clear the last quiz when starting fresh
    quizCache.deleteLastGeneratedQuiz().catch(console.error);
  };

  const handleResetCounter = async () => {
    try {
      await quizCache.resetCounter();
      setGenerationCount(0);
      setRemainingGenerations(100);
      toast.success("Contador reiniciado exitosamente");
    } catch (error) {
      console.error("Error resetting counter:", error);
      toast.error("Error al reiniciar el contador");
    }
  };

  // Show loading while checking for last quiz and generation count
  if (isCheckingLastQuiz || isCheckingLimit) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-start justify-center p-4 animate-pulse">
        <LoadingScreen />
      </div>
    );
  }

  // Show generation limit screen if user has reached the limit
  if (remainingGenerations === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <GenerationLimit onReset={handleResetCounter} />
      </div>
    );
  }

  // Show last quiz option if available
  if (lastQuiz && questions.length === 0) {
    return (
      <div className="min-h-screen p-4">
        <LastQuizPrompt
          lastQuiz={lastQuiz}
          onContinueLastQuiz={(questions, title) => {
            setQuestions(questions);
            setTitle(title);
          }}
          onGenerateNewQuiz={() => {
            setLastQuiz(null);
            quizCache.deleteLastGeneratedQuiz().catch(console.error);
          }}
        />
      </div>
    );
  }

  if (questions.length === 4) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Quiz title={title ?? "Cuestionario"} questions={questions} clearPDF={clearPDF} />
      </div>
    );
  }

  return (
    <QuizGenerator
      onQuizGenerated={(questions, title) => {
          setQuestions(questions);
        setTitle(title);
      }}
      onLastQuizSaved={(lastQuiz) => {
        setLastQuiz(lastQuiz);
      }}
      onGenerationCountUpdated={(count, remaining) => {
        setGenerationCount(count);
        setRemainingGenerations(remaining);
      }}
      generationCount={generationCount}
      remainingGenerations={remainingGenerations}
    />
  );
}
