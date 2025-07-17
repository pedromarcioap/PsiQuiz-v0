"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Brain, Target, ArrowLeft, AlertTriangle, Clock, BookOpen, Zap } from "lucide-react"
import Link from "next/link"
import { useStats } from "@/hooks/useStats" // Assuming you have this hook
import { aiService } from "@/lib/ai-service" // Assuming you have this service
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface PerformanceData {
  topic: string
  totalQuestions: number
  correctAnswers: number
  averageTime: number
  difficulty: "Básico" | "Intermediário" | "Avançado"
  trend: "up" | "down" | "stable"
  weakPoints: string[]
  distractorsFallenFor: string[]
  lastStudied: string
}

export default function PerformanceAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedTopic, setSelectedTopic] = useState("all")
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [aiInsights, setAiInsights] = useState<any[]>([]) // Adjust type as needed
  const [overallStats, setOverallStats] = useState({
    totalQuestions: 0,
    totalCorrect: 0,
    averageScore: 0,
    averageTime: 0,
  })

  // Fetch real data using useStats hook
  const { stats, quizResults, getPerformanceByTopic } = useStats()

  useEffect(() => {
    if (!stats) return

    // always call the function, but don't track it in deps
    const processedPerformanceData: PerformanceData[] = getPerformanceByTopic().map((topic) => ({
      topic: topic.topic,
      totalQuestions: topic.totalQuestions,
      correctAnswers: topic.correctAnswers,
      averageTime: topic.averageTime,
      difficulty: topic.difficulty,
      trend: topic.trend,
      weakPoints: topic.weakPoints,
      distractorsFallenFor: topic.distractorsFallenFor,
      lastStudied: topic.lastStudied,
    }))

    setPerformanceData(processedPerformanceData)

    // --- overall stats --------------------------------------------------------
    const totalQuestions = processedPerformanceData.reduce((acc, t) => acc + t.totalQuestions, 0)
    const totalCorrect = processedPerformanceData.reduce((acc, t) => acc + t.correctAnswers, 0)
    const averageScore = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0
    const averageTime = processedPerformanceData.length
      ? Math.round(
          processedPerformanceData.reduce((acc, t) => acc + t.averageTime, 0) / processedPerformanceData.length,
        )
      : 0

    setOverallStats({ totalQuestions, totalCorrect, averageScore, averageTime })
  }, [stats])

  // Fetch AI insights using aiService
  useEffect(() => {
    const fetchAiInsights = async () => {
      try {
        const insights = await aiService.getInsights(timeRange, selectedTopic) // Adjust parameters as needed
        setAiInsights(insights)
      } catch (error) {
        console.error("Failed to fetch AI insights:", error)
      }
    }

    fetchAiInsights()
  }, [timeRange, selectedTopic])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "weakness":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case "improvement":
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case "distractor":
        return <Target className="h-5 w-5 text-orange-600" />
      default:
        return <Brain className="h-5 w-5 text-blue-600" />
    }
  }

  const topicPerformanceData = performanceData.map((topic) => ({
    name: topic.topic,
    score: Math.round((topic.correctAnswers / topic.totalQuestions) * 100),
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
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
            <Brain className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Análise de Performance IA</h1>
          </div>

          <div className="flex gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tópicos</SelectItem>
                <SelectItem value="cognitive">Psicologia Cognitiva</SelectItem>
                <SelectItem value="personality">Teorias da Personalidade</SelectItem>
                <SelectItem value="neuropsych">Neuropsicologia</SelectItem>
                <SelectItem value="social">Psicologia Social</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{overallStats.totalQuestions}</p>
                  <p className="text-sm text-gray-600">Questões Respondidas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                <div>
                  <p className={`text-2xl font-bold ${getScoreColor(overallStats.averageScore)}`}>
                    {overallStats.averageScore}%
                  </p>
                  <p className="text-sm text-gray-600">Precisão Geral</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{overallStats.averageTime}s</p>
                  <p className="text-sm text-gray-600">Tempo Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">94%</p>
                  <p className="text-sm text-gray-600">IA Precisão</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance by Topic */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Tópico</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topicPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {performanceData.map((topic, index) => {
                    const score = Math.round((topic.correctAnswers / topic.totalQuestions) * 100)
                    return (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{topic.topic}</h3>
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
                            {getTrendIcon(topic.trend)}
                            <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
                          </div>
                        </div>

                        <Progress value={score} className="h-2 mb-3" />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">
                              Questões: {topic.correctAnswers}/{topic.totalQuestions}
                            </p>
                            <p className="text-gray-600">Tempo médio: {topic.averageTime}s</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Último estudo: {topic.lastStudied}</p>
                          </div>
                        </div>

                        {topic.weakPoints.length > 0 && (
                          <div className="mt-3 p-2 bg-red-50 rounded">
                            <p className="text-xs font-medium text-red-800 mb-1">Pontos Fracos:</p>
                            <div className="flex flex-wrap gap-1">
                              {topic.weakPoints.map((point, i) => (
                                <Badge key={i} variant="destructive" className="text-xs">
                                  {point}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {topic.distractorsFallenFor.length > 0 && (
                          <div className="mt-2 p-2 bg-orange-50 rounded">
                            <p className="text-xs font-medium text-orange-800 mb-1">Distratores Problemáticos:</p>
                            <div className="flex flex-wrap gap-1">
                              {topic.distractorsFallenFor.map((distractor, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {distractor}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Distractor Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Análise de Distratores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Mais Problemáticos</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Inversão de Conceitos</span>
                        <span className="font-semibold text-red-600">78% erro</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Moderadamente Problemáticos</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Terminologia Cruzada</span>
                        <span className="font-semibold text-orange-600">65% erro</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Bem Identificados</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Opiniões Disfarçadas</span>
                        <span className="font-semibold text-green-600">25% erro</span>
                      </div>
                      <Progress value={25} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Insights da IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                          <Badge
                            variant={insight.priority === "high" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {insight.priority === "high" ? "Alta Prioridade" : "Média Prioridade"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plano de Melhoria IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Esta Semana</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Revisar Teorias Psicanalíticas (2h)</li>
                      <li>• Praticar identificação de inversões</li>
                      <li>• Quiz focado em pontos fracos</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Próxima Semana</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Aprofundar Neuroplasticidade</li>
                      <li>• Teste de resistência a distratores</li>
                      <li>• Revisão geral consolidada</li>
                    </ul>
                  </div>
                </div>

                <Button className="w-full mt-4">
                  <Link href="/quiz/ai-personalized">Iniciar Plano IA</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Qualidade dos Distratores</span>
                    <span className="font-semibold text-green-600">Excelente</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Precisão da IA</span>
                    <span className="font-semibold text-blue-600">94%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Feedback dos Usuários</span>
                    <span className="font-semibold text-purple-600">4.8/5</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  Avaliar Sistema
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
