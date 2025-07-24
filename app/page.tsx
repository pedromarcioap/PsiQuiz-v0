"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, Clock, BookOpen, TrendingUp, Upload, FileText, Zap, Settings } from "lucide-react"
import Link from "next/link"
import { StatsDashboard } from "@/components/dashboard/stats-dashboard"
import useStats from "@/hooks/useStats"

export default function HomePage() {
  const { data: session } = useSession()
  const { stats, updateStats } = useStats()

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: "content", title: "Neuropsicologia Cognitiva.pdf", questions: 15, date: "2024-01-15" },
    { id: 2, type: "quiz", title: "Teorias da Personalidade", score: 88, mode: "study", date: "2024-01-14" },
    { id: 3, type: "content", title: "Artigo sobre Psicologia Social", questions: 12, date: "2024-01-13" },
  ])

  const [aiInsights, setAiInsights] = useState([
    "Desempenho melhorou 15% em Psicologia Cognitiva",
    "Recomenda-se revisar conceitos de Neuroplasticidade",
    "Padrão de erro identificado em questões sobre Freud",
    "Sugestão: Mais prática em questões de nível avançado",
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Painel de Controle</h1>
          <p className="text-gray-600">Seja bem-vindo ao seu painel de controle de estudos de psicologia.</p>
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Link href="/quiz/generate">
            <Card className="cursor-pointer hover:shadow-md transition-shadow bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Upload className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Carregar Conteúdo</h3>
                    <p className="text-sm text-gray-600">Adicione novos materiais para estudo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/quiz/create">
            <Card className="cursor-pointer hover:shadow-md transition-shadow bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-red-600" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Criar Quiz Manualmente</h3>
                    <p className="text-sm text-gray-600">Desenvolva quizzes personalizados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/quiz/ai-generate">
            <Card className="cursor-pointer hover:shadow-md transition-shadow bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Gerar Quiz IA</h3>
                    <p className="text-sm text-gray-600">Criação automática inteligente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
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
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {activity.type === "content" ? (
                          <FileText className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Brain className="h-5 w-5 text-purple-600" />
                        )}
                        <div>
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-gray-600">
                            {activity.type === "content"
                              ? `${activity.questions} questões geradas`
                              : `Score: ${activity.score}% - ${activity.mode}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{activity.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Insights da IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-800">{insight}</p>
                    </div>
                  ))}
                </div>
                <Link href="/analytics/ai-insights">
                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    Ver Todos os Insights
                  </Button>
                </Link>
              </CardContent>
            </Card>
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Psicologia Cognitiva</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Teorias da Personalidade</span>
                      <span>76%</span>
                    </div>
                    <Progress value={76} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Psicopatologia</span>
                      <span>84%</span>
                    </div>
                    <Progress value={84} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Neuropsicologia</span>
                      <span>68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Content Library */}
            <Card>
              <CardHeader>
                <CardTitle>Biblioteca de Conteúdo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/content/library">
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      📚 Psicologia Cognitiva (5 docs)
                    </Button>
                  </Link>
                  <Link href="/content/library">
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      🧠 Neuropsicologia (3 docs)
                    </Button>
                  </Link>
                  <Link href="/content/library">
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      👥 Psicologia Social (4 docs)
                    </Button>
                  </Link>
                  <Link href="/content/library">
                    <Button variant="ghost" className="w-full justify-start text-sm">
                      🔬 Métodos de Pesquisa (2 docs)
                    </Button>
                  </Link>
                </div>
                <Link href="/content/library">
                  <Button className="w-full mt-4 bg-transparent" variant="outline">
                    Ver Biblioteca Completa
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
