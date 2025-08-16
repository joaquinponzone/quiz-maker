"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { FileUp, Loader2, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { experimental_useObject as useObject } from '@ai-sdk/react';
import { questionsSchema } from "@/lib/schemas";
import { encodeFileAsBase64 } from "@/lib/utils";
import { generateQuizTitle } from "@/app/(home)/actions";
import { quizCache, LastGeneratedQuiz } from "@/lib/quiz-cache";
import GenerationCounter from "@/components/generation-counter";

interface QuizGeneratorProps {
  onQuizGenerated: (questions: any[], title: string) => void;
  onLastQuizSaved: (lastQuiz: LastGeneratedQuiz) => void;
  onGenerationCountUpdated: (count: number, remaining: number) => void;
  generationCount: number;
  remainingGenerations: number;
}

export default function QuizGenerator({
  onQuizGenerated,
  onLastQuizSaved,
  onGenerationCountUpdated,
  generationCount,
  remainingGenerations,
}: QuizGeneratorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");

  const { submit, object: partialQuestions, isLoading: isGenerating } = useObject({
    api: "/api/generate-quiz",
    schema: questionsSchema,
    onFinish: async ({ object }) => {
      onQuizGenerated(object ?? [], title);

      // Save the last generated quiz
      if (selectedFile && object) {
        try {
          const fileData = await encodeFileAsBase64(selectedFile);
          const lastQuiz = {
            id: 'last',
            questions: object,
            title: title || "Cuestionario",
            fileName: selectedFile.name,
            fileType: selectedFile.type,
            fileData: fileData,
            timestamp: Date.now()
          };
          
          await quizCache.saveLastGeneratedQuiz(lastQuiz);
          onLastQuizSaved(lastQuiz);

          // Increment generation count
          const newCount = await quizCache.incrementQuizCount();
          const newRemaining = await quizCache.getRemainingGenerations();
          onGenerationCountUpdated(newCount, newRemaining);
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

  const progressValue = partialQuestions ? (partialQuestions.length / 4) * 100 : 0;

  return (
    <div
      className="sm:flex-1 mx-auto w-[90%] sm:w-full flex justify-center"
      onDragOver={(e) => {
        if (isGenerating) return;
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragExit={() => {
        if (isGenerating) return;
        setIsDragging(false);
      }}
      onDragEnd={() => {
        if (isGenerating) return;
        setIsDragging(false);
      }}
      onDragLeave={() => {
        if (isGenerating) return;
        setIsDragging(false);
      }}
      onDrop={(e) => {
        if (isGenerating) return;
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
      <Card className="w-full max-w-md h-full border sm:mt-12 shadow-lg">
        <CardHeader className="text-center sm:space-y-6">
          <div className="mx-auto flex items-center justify-center space-x-2 text-muted-foreground">
            <div className="rounded-full bg-primary/10 p-2">
              <FileUp className="size-6 text-primary" />
            </div>
            <Plus className="h-4 w-4 text-muted-foreground" />
            <div className="rounded-full bg-primary/10 p-2">
              <Loader2 className="size-6 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              Quiz Maker
            </CardTitle>
            <CardDescription className="text-xs sm:text-base text-muted-foreground">
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
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors shadow-sm ${
                  isGenerating 
                    ? 'cursor-not-allowed bg-muted/30 opacity-50' 
                    : 'cursor-pointer bg-muted/50 hover:bg-muted hover:shadow-md'
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileUp className={`w-8 h-8 mb-4 ${isGenerating ? 'text-muted-foreground/50' : 'text-muted-foreground'}`} />
                  <p className={`mb-2 text-sm ${isGenerating ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                    <span className="font-semibold">
                      {isGenerating ? 'Generando cuestionario...' : 'Haz clic para subir'}
                    </span> {!isGenerating && 'o arrastra y suelta'}
                  </p>
                  <p className={`text-xs ${isGenerating ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
                    Archivos PDF o Markdown (MÁX. 10MB)
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.md,.markdown"
                  onChange={handleFileChange}
                  disabled={isGenerating}
                />
              </label>
            </div>
            <Button
              type="submit"
              variant="secondary"
              className="w-full shadow-md hover:shadow-lg transition-shadow"
              disabled={!selectedFile || isGenerating}
            >
              {isGenerating ? (
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
  );
}
