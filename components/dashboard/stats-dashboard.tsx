"use client"

import { memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Brain, TrendingUp, Clock, Zap } from "lucide-react"

interface StatsDashboardProps {
  stats: {
    totalContent: number
    generatedQuizzes: number
    averageScore: number
    studyTime: number
    aiAccuracy: number
  }
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.totalContent}</p>
              <p className="text-sm text-gray-600">Conteúdos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{stats.generatedQuizzes}</p>
              <p className="text-sm text-gray-600">Quizzes IA</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.averageScore}%</p>
              <p className="text-sm text-gray-600">Média</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">{stats.studyTime}h</p>
              <p className="text-sm text-gray-600">Estudo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold">{stats.aiAccuracy}%</p>
              <p className="text-sm text-gray-600">IA Precisão</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const MemoizedStatsDashboard = memo(StatsDashboard)
