"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { FileUp, Loader2, Plus, FileText, RefreshCcw, FileInput, FilePlus2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "@/components/ui/link";
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { questionsSchema } from "@/lib/schemas";
import { encodeFileAsBase64 } from "@/lib/utils";
import { generateQuizTitle } from "./actions";
import { quizCache, LastGeneratedQuiz } from "@/lib/quiz-cache";
import Quiz from "@/components/quiz";
import GenerationLimit from "@/components/generation-limit";
import GenerationCounter from "@/components/generation-counter";

export default function ChatWithFiles() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const { submit, object: partialQuestions, isLoading: isGenerating } = useObject({
    api: "/api/generate-quiz",
    schema: questionsSchema,
    onFinish: async ({ object }) => {
      setQuestions(object ?? []);

      // Save the last generated quiz
      if (selectedFile && object) {
        try {
          const fileData = await encodeFileAsBase64(selectedFile);
          await quizCache.saveLastGeneratedQuiz({
            id: 'last',
            questions: object,
            title: title || "Cuestionario",
            fileName: selectedFile.name,
            fileType: selectedFile.type,
            fileData: fileData,
            timestamp: Date.now()
          });

          // Increment generation count
          const newCount = await quizCache.incrementQuizCount();
          const newRemaining = await quizCache.getRemainingGenerations();
          setGenerationCount(newCount);
          setRemainingGenerations(newRemaining);
        } catch (error) {
          console.error("Error saving last quiz:", error);
        }
      }
    },
  });

  const validateFile = (file: File): { success: boolean; error?: string } => {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: 'El archivo es demasiado grande. Máximo 10MB.'
      };
    }

    // Check if it's a supported file type
    const isPDF = file.type === 'application/pdf';
    const isMarkdown = file.type === 'text/markdown' ||
      file.name.toLowerCase().endsWith('.md') ||
      file.name.toLowerCase().endsWith('.markdown');

    if (!isPDF && !isMarkdown) {
      return {
        success: false,
        error: 'Tipo de archivo no soportado. Por favor, sube un archivo PDF o Markdown.'
      };
    }

    return { success: true };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validation = validateFile(file);

    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    setSelectedFile(file);
    toast.success("¡Archivo listo para procesar!");
  };

  const handleSubmitWithFiles = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Por favor, sube un archivo válido primero.");
      return;
    }

    // Check if user can generate more quizzes
    const canGenerate = await quizCache.canGenerateQuiz();
    if (!canGenerate) {
      toast.error("Has alcanzado el límite de generaciones. Solicita acceso administrativo.");
      return;
    }

    // Send the original file directly to the API
    const encodedFile = await encodeFileAsBase64(selectedFile);
    submit({
      files: [{
        name: selectedFile.name,
        type: selectedFile.type,
        data: encodedFile,
      }]
    });

    const fileName = selectedFile?.name || "Documento";
    const generatedTitle = await generateQuizTitle(fileName);
    setTitle(generatedTitle);
  };

  const clearPDF = () => {
    setSelectedFile(null);
    setQuestions([]);
    setTitle("");
    setProgress(0);
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

  const progressValue = partialQuestions ? (partialQuestions.length / 4) * 100 : 0;

  // Show loading while checking for last quiz and generation count
  if (isCheckingLastQuiz || isCheckingLimit) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-start justify-center">
        <Card className="w-full max-w-md shadow-lg p-6 mt-32">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <FileInput className="animate-pulse size-16 text-primary" />
              <p className="text-lg font-bold">Chequeando cache...</p>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show generation limit screen if user has reached the limit
  if (remainingGenerations === 0) {
    return <GenerationLimit onReset={handleResetCounter} />;
  }

  // Show last quiz option if available
  if (lastQuiz && questions.length === 0 && !isGenerating) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="w-full max-w-xl shadow-lg p-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">¿Continuar con el último cuestionario?</CardTitle>
            <CardDescription className="text-md text-muted-foreground text-pretty">
              Se encontró un cuestionario generado anteriormente: {lastQuiz.fileName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="secondary"
              onClick={() => {
                setQuestions(lastQuiz.questions);
                setTitle(lastQuiz.title);
              }}
              className="flex gap-2 w-full shadow-md hover:shadow-lg transition-shadow text-md"
            >
              <RefreshCcw /> Repetir el último cuestionario
            </Button>
            <Button
              onClick={() => {
                setLastQuiz(null);
                quizCache.deleteLastGeneratedQuiz().catch(console.error);
              }}
              variant="outline"
              className="flex gap-2 w-full shadow-md hover:shadow-lg transition-shadow text-md"
            >
              <FilePlus2 /> Generar nuevo cuestionario
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 4) {
    return (
      <Quiz title={title ?? "Cuestionario"} questions={questions} clearPDF={clearPDF} />
    );
  }

  return (
    <main className="flex flex-col h-full">
      <div
        className="sm:flex-1 mx-auto w-[80%] sm:w-full flex justify-center"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragExit={() => setIsDragging(false)}
        onDragEnd={() => setIsDragging(false)}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const files = e.dataTransfer.files;
          if (files && files.length > 0) {
            const file = files[0];
            const validation = validateFile(file);

            if (!validation.success) {
              toast.error(validation.error);
              return;
            }

            setSelectedFile(file);
            toast.success("¡Archivo listo para procesar!");
          }
        }}
      >
        <AnimatePresence>
          {isDragging && (
            <motion.div
              className="fixed pointer-events-none dark:bg-zinc-900/90 h-dvh w-dvw z-10 justify-center items-center flex flex-col gap-1 bg-zinc-100/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div>Arrastra y suelta archivos aquí</div>
              <div className="text-sm dark:text-zinc-400 text-zinc-500">
                {"(Archivos PDF y Markdown)"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Card className="w-full max-w-md h-full border mt-12 shadow-lg">
          <CardHeader className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center space-x-2 text-muted-foreground">
              <div className="rounded-full bg-primary/10 p-2">
                <FileUp className="h-6 w-6 text-primary" />
              </div>
              <Plus className="h-4 w-4 text-muted-foreground" />
              <div className="rounded-full bg-primary/10 p-2">
                <Loader2 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-foreground">
                Quiz Maker
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                <p>
                  Subí un archivo PDF o Markdown para generar un cuestionario interactivo basado en su contenido usando AI 🤖
                </p>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Generation Counter */}
            <GenerationCounter
              currentCount={generationCount}
              maxGenerations={100}
              remainingGenerations={remainingGenerations}
            />

            {selectedFile && (
              <div className="p-3 rounded-lg border shadow-sm bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Archivo listo para procesar: {selectedFile.name}
                  </span>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="space-y-2">
                <Progress value={progressValue} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Generando cuestionario... {Math.round(progressValue)}%
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitWithFiles} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileUp className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Archivos PDF o Markdown (MÁX. 10MB)
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.md,.markdown"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <Button
                type="submit"
                className="w-full shadow-md hover:shadow-lg transition-shadow"
                disabled={!selectedFile || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando Cuestionario...
                  </>
                ) : (
                  "Generar Cuestionario"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-xs text-muted-foreground text-center">
              <p>
                💡 <strong>Consejo:</strong> Podes subir archivos PDF o Markdown para generar cuestionarios interactivos!
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>

    </main>
  );
}
