"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Brain, Clock, Target, ArrowLeft, BookOpen } from "lucide-react"
import Link from "next/link"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")

  const performanceData = {
    overall: {
      totalQuizzes: 15,
      averageScore: 78,
      totalTime: 120,
      improvement: 12,
    },
    byTopic: [
      { topic: "Psicologia Cognitiva", score: 85, quizzes: 5, trend: "up", difficulty: "Intermediário" },
      { topic: "Teorias da Personalidade", score: 72, quizzes: 3, trend: "down", difficulty: "Avançado" },
      { topic: "Psicologia Social", score: 90, quizzes: 4, trend: "up", difficulty: "Básico" },
      { topic: "Psicopatologia", score: 68, quizzes: 3, trend: "up", difficulty: "Avançado" },
    ],
    weakAreas: [
      { topic: "Teorias Psicanalíticas", score: 45, priority: "Alta" },
      { topic: "Neuropsicologia", score: 52, priority: "Média" },
      { topic: "Métodos de Pesquisa", score: 58, priority: "Média" },
    ],
    recommendations: [
      "Revisar conceitos fundamentais de Teorias Psicanalíticas",
      "Praticar mais questões sobre Neuropsicologia",
      "Focar em questões de nível avançado",
      "Aumentar tempo de estudo em 15 minutos por sessão",
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <Brain className="h-6 w-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Análise de Performance</h1>
          </div>

          <div className="flex gap-2">
            {["7d", "30d", "90d"].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === "7d" ? "7 dias" : range === "30d" ? "30 dias" : "90 dias"}
              </Button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{performanceData.overall.totalQuizzes}</p>
                  <p className="text-sm text-gray-600">Quizzes Realizados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{performanceData.overall.averageScore}%</p>
                  <p className="text-sm text-gray-600">Média Geral</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">+{performanceData.overall.improvement}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{performanceData.overall.totalTime}h</p>
                  <p className="text-sm text-gray-600">Tempo Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{performanceData.byTopic.length}</p>
                  <p className="text-sm text-gray-600">Tópicos Estudados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance by Topic */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Tópico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.byTopic.map((topic, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{topic.topic}</span>
                          <Badge
                            variant={
                              topic.difficulty === "Básico"
                                ? "default"
                                : topic.difficulty === "Intermediário"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {topic.difficulty}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {topic.trend === "up" ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className="font-semibold">{topic.score}%</span>
                        </div>
                      </div>
                      <Progress value={topic.score} className="h-2" />
                      <p className="text-xs text-gray-600">{topic.quizzes} quizzes realizados</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weak Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">Áreas que Precisam de Atenção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.weakAreas.map((area, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-red-800">{area.topic}</h4>
                        <p className="text-sm text-red-600">Score: {area.score}%</p>
                      </div>
                      <Badge variant={area.priority === "Alta" ? "destructive" : "secondary"}>{area.priority}</Badge>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-transparent" variant="outline">
                  <Link href="/quiz/review">Iniciar Revisão Focada</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Recomendações da IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performanceData.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <p className="text-purple-800 text-sm">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Study Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Plano de Estudos Personalizado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Esta Semana</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• 3 sessões de Teorias Psicanalíticas (30 min cada)</li>
                      <li>• 2 sessões de Neuropsicologia (45 min cada)</li>
                      <li>• 1 quiz de revisão geral</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Próxima Semana</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Aprofundar Métodos de Pesquisa</li>
                      <li>• Quiz avançado de Psicopatologia</li>
                      <li>• Revisão de pontos fortes</li>
                    </ul>
                  </div>
                </div>

                <Button className="w-full mt-4">Seguir Plano de Estudos</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
