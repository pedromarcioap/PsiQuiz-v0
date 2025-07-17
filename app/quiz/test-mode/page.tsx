"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  difficulty: "Básico" | "Intermediário" | "Avançado"
  topic: string
}

export default function TestModePage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([])
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes
  const [isTimeUp, setIsTimeUp] = useState(false)

  const questions: Question[] = [
    {
      id: 1,
      question: "Qual é o principal conceito da Teoria Cognitiva de Jean Piaget?",
      options: [
        "Condicionamento operante",
        "Desenvolvimento cognitivo por estágios",
        "Inconsciente coletivo",
        "Behaviorismo radical",
      ],
      correctAnswer: 1,
      difficulty: "Intermediário",
      topic: "Psicologia do Desenvolvimento",
    },
    {
      id: 2,
      question: "O que caracteriza o transtorno de ansiedade generalizada (TAG)?",
      options: [
        "Medo específico de objetos ou situações",
        "Preocupação excessiva e persistente sobre diversos aspectos da vida",
        "Episódios recorrentes de pânico",
        "Comportamentos compulsivos repetitivos",
      ],
      correctAnswer: 1,
      difficulty: "Básico",
      topic: "Psicopatologia",
    },
    {
      id: 3,
      question:
        "Segundo a Teoria da Dissonância Cognitiva de Leon Festinger, o que acontece quando há inconsistência entre atitudes e comportamentos?",
      options: [
        "A pessoa ignora a inconsistência",
        "Surge um estado de desconforto psicológico que motiva mudanças",
        "O comportamento sempre prevalece sobre a atitude",
        "Não há impacto psicológico significativo",
      ],
      correctAnswer: 1,
      difficulty: "Avançado",
      topic: "Psicologia Social",
    },
  ]

  useEffect(() => {
    setSelectedAnswers(new Array(questions.length).fill(null))
  }, [])

  useEffect(() => {
    if (timeLeft > 0 && !isTimeUp) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setIsTimeUp(true)
    }
  }, [timeLeft, isTimeUp])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredCount = selectedAnswers.filter((answer) => answer !== null).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <Clock className="h-6 w-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">Modo Teste</h1>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Progress value={progress} className="flex-1" />
            <span className="text-sm font-medium">
              {currentQuestion + 1} de {questions.length}
            </span>
          </div>
        </div>

        {/* Timer and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className={`h-5 w-5 ${timeLeft < 300 ? "text-red-600" : "text-orange-600"}`} />
                <div>
                  <p className={`text-2xl font-bold ${timeLeft < 300 ? "text-red-600" : "text-orange-600"}`}>
                    {formatTime(timeLeft)}
                  </p>
                  <p className="text-sm text-gray-600">Tempo Restante</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{answeredCount}</p>
                  <p className="text-sm text-gray-600">Respondidas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-2xl font-bold text-gray-600">{questions.length - answeredCount}</p>
                  <p className="text-sm text-gray-600">Restantes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Warning for low time */}
        {timeLeft < 300 && timeLeft > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <p className="font-medium">Atenção! Menos de 5 minutos restantes!</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge
                variant={
                  questions[currentQuestion].difficulty === "Básico"
                    ? "default"
                    : questions[currentQuestion].difficulty === "Intermediário"
                      ? "secondary"
                      : "destructive"
                }
              >
                {questions[currentQuestion].difficulty}
              </Badge>
              <Badge variant="outline">{questions[currentQuestion].topic}</Badge>
            </div>
            <CardTitle className="text-xl">{questions[currentQuestion].question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswers[currentQuestion] === index ? "secondary" : "outline"}
                  className="w-full text-left justify-start p-4 h-auto"
                  onClick={() => handleAnswerSelect(index)}
                  disabled={isTimeUp}
                >
                  <span>{option}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={previousQuestion} disabled={currentQuestion === 0 || isTimeUp}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">Progresso</p>
            <p className="text-lg font-bold text-orange-600">{Math.round(progress)}%</p>
          </div>

          {currentQuestion < questions.length - 1 ? (
            <Button onClick={nextQuestion} disabled={isTimeUp}>
              Próxima
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Link href="/quiz/results">
              <Button disabled={isTimeUp && answeredCount === 0}>
                {isTimeUp ? "Tempo Esgotado - Ver Resultado" : "Finalizar Teste"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>

        {/* Question Navigator */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Navegação Rápida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {questions.map((_, index) => (
                <Button
                  key={index}
                  variant={
                    index === currentQuestion ? "default" : selectedAnswers[index] !== null ? "secondary" : "outline"
                  }
                  size="sm"
                  onClick={() => setCurrentQuestion(index)}
                  disabled={isTimeUp}
                  className="aspect-square"
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
