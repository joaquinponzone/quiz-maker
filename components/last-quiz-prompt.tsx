"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, FilePlus2 } from "lucide-react";
import { LastGeneratedQuiz } from "@/lib/quiz-cache";

interface LastQuizPromptProps {
  lastQuiz: LastGeneratedQuiz;
  onContinueLastQuiz: (questions: any[], title: string) => void;
  onGenerateNewQuiz: () => void;
}

export default function LastQuizPrompt({
  lastQuiz,
  onContinueLastQuiz,
  onGenerateNewQuiz,
}: LastQuizPromptProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <Card className="w-full max-w-xl shadow-lg p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">¿Continuar con el último cuestionario?</CardTitle>
          <CardDescription className="text-md text-muted-foreground">
            Se encontró un cuestionario generado anteriormente: {lastQuiz.fileName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="secondary"
            onClick={() => onContinueLastQuiz(lastQuiz.questions, lastQuiz.title)}
            className="flex gap-2 w-full shadow-md hover:shadow-lg transition-shadow text-sm sm:text-md"
          >
            <RefreshCcw /> Repetir el último cuestionario
          </Button>
          <Button
            onClick={onGenerateNewQuiz}
            variant="outline"
            className="flex gap-2 w-full shadow-md hover:shadow-lg transition-shadow text-sm sm:text-md"
          >
            <FilePlus2 /> Generar nuevo cuestionario
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
