"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, BookOpen, Brain } from "lucide-react"
import Link from "next/link"
import { useStats } from "@/hooks/useStats"

interface Question {
  id?: number // Made optional as it might not come from AI with an ID
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: "Básico" | "Intermediário" | "Avançado"
  topic: string
}

export default function StudyModePage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [score, setScore] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([])
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [userAnswers, setUserAnswers] = useState<number[]>([])
  const [questions, setQuestions] = useState<Question[]>([]) // State to hold questions

  const { addQuizResult } = useStats()

  useEffect(() => {
    const storedQuestions = localStorage.getItem("currentQuizQuestions")
    if (storedQuestions) {
      const parsedQuestions: Question[] = JSON.parse(storedQuestions)
      setQuestions(parsedQuestions.map((q, index) => ({ ...q, id: index + 1 }))) // Add ID if not present
      setAnsweredQuestions(new Array(parsedQuestions.length).fill(false))
      setUserAnswers(new Array(parsedQuestions.length).fill(-1))
      setStartTime(Date.now())
    } else {
      // Fallback to default questions if no stored questions (e.g., direct navigation)
      setQuestions([
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
          explanation:
            "Piaget propôs que o desenvolvimento cognitivo ocorre em estágios sequenciais: sensório-motor, pré-operacional, operações concretas e operações formais.",
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
          explanation:
            "O TAG é caracterizado por ansiedade e preocupação excessivas sobre múltiplas áreas da vida, sendo difícil de controlar e causando sofrimento significativo.",
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
          explanation:
            "A dissonância cognitiva cria desconforto psicológico que motiva a pessoa a reduzir a inconsistência, seja mudando atitudes, comportamentos ou justificativas.",
          difficulty: "Avançado",
          topic: "Psicologia Social",
        },
      ])
      setAnsweredQuestions(new Array(3).fill(false))
      setUserAnswers(new Array(3).fill(-1))
      setStartTime(Date.now())
    }
  }, [])

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    setShowFeedback(true)

    const newAnsweredQuestions = [...answeredQuestions]
    newAnsweredQuestions[currentQuestion] = true
    setAnsweredQuestions(newAnsweredQuestions)

    const newUserAnswers = [...userAnswers]
    newUserAnswers[currentQuestion] = answerIndex
    setUserAnswers(newUserAnswers)

    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(userAnswers[currentQuestion - 1])
      setShowFeedback(userAnswers[currentQuestion - 1] !== -1)
    }
  }

  const finishQuiz = () => {
    const timeSpent = Date.now() - startTime
    const finalScore = Math.round((score / questions.length) * 100)

    addQuizResult({
      title: "Modo Estudo - Psicologia Geral", // This title could be dynamic based on generated quiz topic
      score: finalScore,
      totalQuestions: questions.length,
      correctAnswers: score,
      timeSpent: timeSpent,
      difficulty: "Misto", // This could be dynamic based on generated quiz difficulty
      mode: "study",
    })
    localStorage.removeItem("currentQuizQuestions") // Clear stored questions after finishing
  }

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardTitle>Carregando Quiz...</CardTitle>
          <p className="text-gray-600 mt-2">Por favor, aguarde enquanto as questões são carregadas.</p>
          <Link href="/quiz/ai-generator">
            <Button className="mt-4">Gerar Novo Quiz</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Modo Estudo</h1>
            <Badge variant="outline" className="ml-auto">
              <Brain className="h-3 w-3 mr-1" />
              IA Ativada
            </Badge>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <Progress value={progress} className="flex-1" />
            <span className="text-sm font-medium">
              {currentQuestion + 1} de {questions.length}
            </span>
          </div>
        </div>

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
                  variant={
                    showFeedback
                      ? index === questions[currentQuestion].correctAnswer
                        ? "default"
                        : selectedAnswer === index
                          ? "destructive"
                          : "outline"
                      : selectedAnswer === index
                        ? "secondary"
                        : "outline"
                  }
                  className={`w-full text-left justify-start p-4 h-auto ${
                    showFeedback && index === questions[currentQuestion].correctAnswer
                      ? "bg-green-100 border-green-500 text-green-800"
                      : showFeedback && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer
                        ? "bg-red-100 border-red-500 text-red-800"
                        : ""
                  }`}
                  onClick={() => !showFeedback && handleAnswerSelect(index)}
                  disabled={showFeedback}
                >
                  <div className="flex items-center gap-3">
                    {showFeedback && index === questions[currentQuestion].correctAnswer && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {showFeedback && selectedAnswer === index && index !== questions[currentQuestion].correctAnswer && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span>{option}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feedback Card */}
        {showFeedback && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div
                className={`flex items-start gap-3 ${
                  selectedAnswer === questions[currentQuestion].correctAnswer ? "text-green-800" : "text-red-800"
                }`}
              >
                {selectedAnswer === questions[currentQuestion].correctAnswer ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold mb-2">
                    {selectedAnswer === questions[currentQuestion].correctAnswer ? "Correto!" : "Incorreto!"}
                  </p>
                  <p className="text-gray-700">{questions[currentQuestion].explanation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={previousQuestion} disabled={currentQuestion === 0}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">Pontuação atual</p>
            <p className="text-2xl font-bold text-indigo-600">
              {score}/{answeredQuestions.filter(Boolean).length}
            </p>
          </div>

          {currentQuestion < questions.length - 1 ? (
            <Button onClick={nextQuestion} disabled={!showFeedback}>
              Próxima
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              disabled={!showFeedback}
              onClick={() => {
                finishQuiz()
                window.location.href = "/quiz/results"
              }}
            >
              Finalizar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
