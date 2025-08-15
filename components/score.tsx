import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuizScoreProps {
  correctAnswers: number
  totalQuestions: number
}

export default function QuizScore({ correctAnswers, totalQuestions }: QuizScoreProps) {
  const score = (correctAnswers / totalQuestions) * 100
  const roundedScore = Math.round(score)

  const getMessage = () => {
    if (score === 100) return "¡Puntuación perfecta! ¡Felicitaciones!"
    if (score >= 80) return "¡Excelente trabajo! Lo hiciste muy bien."
    if (score >= 60) return "¡Buen esfuerzo! Vas por el camino correcto."
    if (score >= 40) return "No está mal, pero hay espacio para mejorar."
    return "¡Sigue practicando, mejorarás!"
  }

  return (
    <Card className="w-full shadow-lg">
      <CardContent className="space-y-4 p-8">
        <div className="text-center">
          <p className="text-4xl font-bold text-primary">{roundedScore}%</p>
          <p className="text-sm text-muted-foreground">
            {correctAnswers} de {totalQuestions} correctas
          </p>
        </div>
        <p className="text-center font-medium text-foreground">{getMessage()}</p>
      </CardContent>
    </Card>
  )
}
