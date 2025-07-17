"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, ArrowLeft, RotateCcw, Brain, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import { useStats } from "@/hooks/useStats"

export default function QuizResultsPage() {
  const { quizResults, stats } = useStats()
  const [latestResult, setLatestResult] = useState<any>(null)

  useEffect(() => {
    if (quizResults.length > 0) {
      setLatestResult(quizResults[0])
    }
  }, [quizResults])

  if (!latestResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-600">Nenhum resultado encontrado.</p>
              <Link href="/">
                <Button className="mt-4">Voltar ao Início</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Excelente! Performance excepcional!"
    if (score >= 80) return "Muito bom! Continue assim!"
    if (score >= 70) return "Bom trabalho! Há espaço para melhorar."
    if (score >= 60) return "Performance razoável. Recomenda-se mais estudo."
    return "Precisa de mais prática. Não desista!"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
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
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">Resultados do Quiz</h1>
          </div>
        </div>

        {/* Main Results */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{latestResult.title}</CardTitle>
              <Badge variant="outline">{new Date(latestResult.date).toLocaleDateString()}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(latestResult.score)}`}>
                {latestResult.score}%
              </div>
              <p className="text-lg text-gray-600 mb-4">{getPerformanceMessage(latestResult.score)}</p>
              <Progress value={latestResult.score} className="h-4 mb-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{latestResult.correctAnswers}</p>
                <p className="text-sm text-gray-600">Respostas Corretas</p>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <XCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">
                  {latestResult.totalQuestions - latestResult.correctAnswers}
                </p>
                <p className="text-sm text-gray-600">Respostas Incorretas</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(latestResult.timeSpent / 1000 / 60)}min
                </p>
                <p className="text-sm text-gray-600">Tempo Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Análise da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Pontos Fortes</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Boa compreensão de conceitos básicos</li>
                  <li>• Tempo de resposta adequado</li>
                  <li>• Consistência nas respostas</li>
                </ul>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">Áreas para Melhoria</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Revisar teorias da personalidade</li>
                  <li>• Praticar mais questões avançadas</li>
                  <li>• Atenção aos distratores por inversão</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Recomendações</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Dedique 30min extras ao estudo de Freud vs Jung</li>
                  <li>• Pratique identificação de conceitos invertidos</li>
                  <li>• Refaça este quiz em 3 dias</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Comparison */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Progresso Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{stats.averageScore}%</p>
                <p className="text-sm text-gray-600">Média Geral</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.generatedQuizzes}</p>
                <p className="text-sm text-gray-600">Quizzes Feitos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.studyTime}h</p>
                <p className="text-sm text-gray-600">Tempo Estudado</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.totalQuestions}</p>
                <p className="text-sm text-gray-600">Questões Respondidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/quiz/study-mode">
            <Button className="w-full bg-transparent" variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Refazer Quiz
            </Button>
          </Link>

          <Link href="/analytics/performance">
            <Button className="w-full bg-transparent" variant="outline">
              <Brain className="h-4 w-4 mr-2" />
              Ver Análise Completa
            </Button>
          </Link>

          <Link href="/quiz/ai-personalized">
            <Button className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              Quiz Personalizado IA
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
