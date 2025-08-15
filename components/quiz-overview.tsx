import { Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Question } from '@/lib/schemas'


interface QuizReviewProps {
  questions: Question[]
  userAnswers: string[]
}

export default function QuizReview({ questions, userAnswers }: QuizReviewProps) {
  const answerLabels: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"]

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">Revisión del Cuestionario</CardTitle>
      </CardHeader>
      <CardContent>
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="mb-8 last:mb-0">
              <h3 className="text-lg font-semibold mb-4 text-foreground">{question.question}</h3>
              <div className="space-y-3">
                {question.options.map((option, optionIndex) => {
                  const currentLabel = answerLabels[optionIndex]
                  const isCorrect = currentLabel === question.answer
                  const isSelected = currentLabel === userAnswers[questionIndex]
                  const isIncorrectSelection = isSelected && !isCorrect

                  return (
                    <Card
                      key={optionIndex}
                      className={`shadow-sm ${
                        isCorrect
                          ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950/20'
                          : isIncorrectSelection
                          ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-950/20'
                          : 'border border-border hover:shadow-md'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <span className="text-lg font-medium text-muted-foreground shrink-0 w-6">
                            {currentLabel}
                          </span>
                          <span className="flex-grow text-foreground">{option}</span>
                          {isCorrect && (
                            <Check className="ml-2 shrink-0 text-green-600 dark:text-green-400" size={20} />
                          )}
                          {isIncorrectSelection && (
                            <X className="ml-2 shrink-0 text-red-600 dark:text-red-400" size={20} />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}

