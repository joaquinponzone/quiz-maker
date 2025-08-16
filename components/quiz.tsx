import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RefreshCw,
  FileText,
} from "lucide-react";
import QuizScore from "./score";
import QuizReview from "./quiz-overview";
import { Question } from "@/lib/schemas";
import { quizCache, QuizData } from "@/lib/quiz-cache";

type QuizProps = {
  questions: Question[];
  clearPDF: () => void;
  title: string;
};

const QuestionCard: React.FC<{
  question: Question;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  isSubmitted: boolean;
  showCorrectAnswer: boolean;
}> = ({ question, selectedAnswer, onSelectAnswer, showCorrectAnswer }) => {
  const answerLabels = ["A", "B", "C", "D"];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold leading-tight">
        {question.question}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {question.options.map((option, index) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedAnswer === answerLabels[index]
                ? "ring-2 ring-primary bg-primary/5 shadow-md"
                : "hover:bg-accent/50"
            } ${
              showCorrectAnswer && answerLabels[index] === question.answer
                ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20 shadow-md"
                : showCorrectAnswer &&
                    selectedAnswer === answerLabels[index] &&
                    selectedAnswer !== question.answer
                  ? "ring-2 ring-red-500 bg-red-50 dark:bg-red-950/20 shadow-md"
                  : ""
            }`}
            onClick={() => onSelectAnswer(answerLabels[index])}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start space-x-4">
                <span className="text-lg font-medium text-muted-foreground shrink-0">
                  {answerLabels[index]}
                </span>
                <span className="flex-grow text-left">{option}</span>
                {(showCorrectAnswer && answerLabels[index] === question.answer) ||
                  (selectedAnswer === answerLabels[index] && (
                    <Check className="ml-2 shrink-0 text-green-600 dark:text-green-400" size={20} />
                  ))}
                {showCorrectAnswer &&
                  selectedAnswer === answerLabels[index] &&
                  selectedAnswer !== question.answer && (
                    <X className="ml-2 shrink-0 text-red-600 dark:text-red-400" size={20} />
                  )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default function Quiz({
  questions,
  clearPDF,
  title = "Quiz",
}: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill(null),
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [quizId, setQuizId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize quiz and check for cached data
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        // Generate a unique ID for this quiz session
        const newQuizId = quizCache.generateQuizId();
        setQuizId(newQuizId);

        // Check if there's cached data for this quiz
        const cachedQuiz = await quizCache.getQuiz(newQuizId);
        
        if (cachedQuiz && cachedQuiz.questions.length === questions.length) {
          // Restore cached state
          setCurrentQuestionIndex(cachedQuiz.currentQuestionIndex);
          setAnswers(cachedQuiz.answers);
          setIsSubmitted(cachedQuiz.isSubmitted);
          setScore(cachedQuiz.score);
          setProgress(cachedQuiz.progress);
        } else {
          // Save initial state
          await saveQuizState();
        }
      } catch (error) {
        console.error("Error initializing quiz cache:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (questions.length > 0) {
      initializeQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  // Save quiz state to cache
  const saveQuizState = async () => {
    if (!quizId || questions.length === 0) return;

    try {
      await quizCache.saveQuiz({
        id: quizId,
        questions,
        title,
        answers,
        currentQuestionIndex,
        isSubmitted,
        score,
        progress,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error saving quiz state:", error);
    }
  };

  // Save state whenever it changes
  useEffect(() => {
    if (!isLoading && quizId) {
      saveQuizState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, currentQuestionIndex, isSubmitted, score, progress, isLoading, quizId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((currentQuestionIndex / questions.length) * 100);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentQuestionIndex, questions.length]);

  const handleSelectAnswer = (answer: string) => {
    if (!isSubmitted) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = answer;
      setAnswers(newAnswers);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const correctAnswers = questions.reduce((acc, question, index) => {
      return acc + (question.answer === answers[index] ? 1 : 0);
    }, 0);
    setScore(correctAnswers);
  };

  const handleReset = async () => {
    setAnswers(Array(questions.length).fill(null));
    setIsSubmitted(false);
    setScore(null);
    setCurrentQuestionIndex(0);
    setProgress(0);
    
    // Clear cached data for this quiz
    if (quizId) {
      try {
        await quizCache.deleteQuiz(quizId);
      } catch (error) {
        console.error("Error clearing quiz cache:", error);
      }
    }
  };

  const handleClearPDF = async () => {
    // Clear cached data before clearing PDF
    if (quizId) {
      try {
        await quizCache.deleteQuiz(quizId);
      } catch (error) {
        console.error("Error clearing quiz cache:", error);
      }
    }
    clearPDF();
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando cuestionario...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-foreground">
        {title}
      </h1>
      <div className="relative">
        {!isSubmitted && <Progress value={progress} className="h-1 mb-8" />}
        <div className="min-h-[400px]">
          {" "}
          {/* Prevent layout shift */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isSubmitted ? "results" : currentQuestionIndex}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {!isSubmitted ? (
                <Card className="w-full shadow-lg">
                  <CardContent className="px-4 py-6 sm:px-8 sm:py-8">
                    <div className="space-y-8">
                      <QuestionCard
                        question={currentQuestion}
                        selectedAnswer={answers[currentQuestionIndex]}
                        onSelectAnswer={handleSelectAnswer}
                        isSubmitted={isSubmitted}
                        showCorrectAnswer={false}
                      />
                      <div className="flex justify-between items-center pt-4">
                        <Button
                          onClick={handlePreviousQuestion}
                          disabled={currentQuestionIndex === 0}
                          variant="ghost"
                          className="hover:bg-accent"
                        >
                          <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                        </Button>
                        <span className="text-sm font-medium text-muted-foreground">
                          {currentQuestionIndex + 1} / {questions.length}
                        </span>
                        <Button
                          onClick={handleNextQuestion}
                          disabled={answers[currentQuestionIndex] === null}
                          variant="ghost"
                          className="hover:bg-accent"
                        >
                          {currentQuestionIndex === questions.length - 1
                            ? "Enviar"
                            : "Siguiente"}{" "}
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  <QuizScore
                    correctAnswers={score ?? 0}
                    totalQuestions={questions.length}
                  />
                  <div className="space-y-12">
                    <QuizReview questions={questions} userAnswers={answers} />
                  </div>
                  <Card className="w-full shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button
                          onClick={handleReset}
                          variant="outline"
                          className="bg-secondary hover:bg-secondary/80 w-full"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" /> Reiniciar Cuestionario
                        </Button>
                        <Button
                          onClick={handleClearPDF}
                          className="bg-primary hover:bg-primary/90 w-full"
                        >
                          <FileText className="mr-2 h-4 w-4" /> Probar Otro PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
