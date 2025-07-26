"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, Clock, BookOpen, TrendingUp, Upload, FileText, Zap, Settings } from "lucide-react"
import Link from "next/link"
import { MemoizedStatsDashboard as StatsDashboard } from "@/components/dashboard/stats-dashboard"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { MemoizedRecentActivity as RecentActivity } from "@/components/dashboard/recent-activity"
import { MemoizedAIInsights as AIInsights } from "@/components/dashboard/ai-insights"
import { MemoizedWeeklyPerformance as WeeklyPerformance } from "@/components/dashboard/weekly-performance"
import { MemoizedContentLibrary as ContentLibrary } from "@/components/dashboard/content-library"
import { useToast } from "@/components/ui/use-toast"

type Stats = {
  totalContent: number
  generatedQuizzes: number
  averageScore: number
  studyTime: number
  aiAccuracy: number
}

export default function HomePage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [stats, setStats] = useState<Stats>({
    totalContent: 0,
    generatedQuizzes: 0,
    averageScore: 0,
    studyTime: 0,
    aiAccuracy: 0,
  })

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: "content", title: "Neuropsicologia Cognitiva.pdf", questions: 15, date: "2024-01-15" },
    { id: 2, type: "quiz", title: "Teorias da Personalidade", score: 88, mode: "study", date: "2024-01-14" },
    { id: 3, type: "content", title: "Artigo sobre Psicologia Social", questions: 12, date: "2024-01-13" },
  ])

  const weeklyPerformance = [
    { topic: "Psicologia Cognitiva", score: 92 },
    { topic: "Teorias da Personalidade", score: 76 },
    { topic: "Psicopatologia", score: 84 },
    { topic: "Neuropsicologia", score: 68 },
  ]

  const contentLibrary = [
    { name: "Psicologia Cognitiva", icon: "📚", count: 5 },
    { name: "Neuropsicologia", icon: "🧠", count: 3 },
    { name: "Psicologia Social", icon: "👥", count: 4 },
    { name: "Métodos de Pesquisa", icon: "🔬", count: 2 },
  ]

  const [aiInsights, setAiInsights] = useState([
    "Desempenho melhorou 15% em Psicologia Cognitiva",
    "Recomenda-se revisar conceitos de Neuroplasticidade",
    "Padrão de erro identificado em questões sobre Freud",
    "Sugestão: Mais prática em questões de nível avançado",
  ])

  /**
   * Fetches the user's stats from the database when the session is loaded.
   */
  useEffect(() => {
    const fetchStats = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch("/api/stats")
          if (response.ok) {
            const data = await response.json()
            setStats({
              totalContent: data.contentsProcessed,
              generatedQuizzes: data.questionsGenerated,
              averageScore: data.averageScore,
              studyTime: data.totalTimeSpent,
              aiAccuracy: 0, // This will be addressed later
            })
          } else {
            throw new Error("Failed to fetch stats")
          }
        } catch (error) {
          console.error("Failed to fetch stats:", error)
          toast({
            title: "Erro ao buscar estatísticas",
            description: "Não foi possível carregar suas estatísticas. Tente novamente mais tarde.",
            variant: "destructive",
          })
        }
      }
    }

    fetchStats()
  }, [session])

  /**
   * Updates the user's stats in the database.
   * @param newStats The new stats to be saved.
   */
  const updateStats = async (newStats: Stats) => {
    setStats(newStats)
    if (session?.user?.id) {
      try {
        await fetch("/api/stats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contentsProcessed: newStats.totalContent,
            questionsGenerated: newStats.generatedQuizzes,
            averageScore: newStats.averageScore,
            totalTimeSpent: newStats.studyTime,
          }),
        })
      } catch (error) {
        console.error("Failed to update stats:", error)
        toast({
          title: "Erro ao atualizar estatísticas",
          description: "Não foi possível salvar suas estatísticas. Tente novamente mais tarde.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  PsiQuiz AI
                </h1>
                <p className="text-gray-600">Plataforma Inteligente para Estudos em Psicologia</p>
              </div>
            </div>
            <div>
              {session ? (
                <Button onClick={() => signOut()} variant="outline" size="sm">
                  Sair
                </Button>
              ) : (
                <Button onClick={() => signIn()} variant="outline" size="sm">
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Stats Dashboard */}
        <StatsDashboard stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Study Modes */}
            <Card>
              <CardHeader>
                <CardTitle>Modos de Estudo</CardTitle>
                <CardDescription>Escolha como deseja estudar hoje</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/quiz/study-mode">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-8 w-8 text-blue-600" />
                          <div>
                            <h3 className="font-semibold text-lg">Modo Estudo</h3>
                            <p className="text-sm text-gray-600">Sem tempo, feedback imediato</p>
                            <p className="text-xs text-blue-600 mt-1">Recomendado para aprendizado</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link href="/quiz/test-mode">
                    <Card className="cursor-pointer hover:shadow-md transition-shadow bg-orange-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Clock className="h-8 w-8 text-orange-600" />
                          <div>
                            <h3 className="font-semibold text-lg">Modo Teste</h3>
                            <p className="text-sm text-gray-600">Tempo limitado, feedback final</p>
                            <p className="text-xs text-orange-600 mt-1">Simula condições reais</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">🤖 Quiz Personalizado IA</h4>
                  <p className="text-sm text-purple-700 mb-3">
                    Baseado na sua performance, a IA recomenda focar em: <strong>Teorias Psicanalíticas</strong>
                  </p>
                  <Link href="/quiz/ai-personalized">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Iniciar Quiz IA
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <RecentActivity activities={recentActivity} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Insights */}
            <AIInsights insights={aiInsights} />

            {/* Quick Stats */}
            <WeeklyPerformance performance={weeklyPerformance} />

            {/* Content Library */}
            <ContentLibrary items={contentLibrary} />
          </div>
        </div>
      </div>
    </div>
  )
}
