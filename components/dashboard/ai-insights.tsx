"use client"

import { memo } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"

interface AIInsightsProps {
  insights: string[]
}

export function AIInsights({ insights }: AIInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Insights da IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
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
  )
}

export const MemoizedAIInsights = memo(AIInsights)
