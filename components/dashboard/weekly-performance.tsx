"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface PerformanceData {
  topic: string
  score: number
}

interface WeeklyPerformanceProps {
  performance: PerformanceData[]
}

export function WeeklyPerformance({ performance }: WeeklyPerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performance.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span>{item.topic}</span>
                <span>{item.score}%</span>
              </div>
              <Progress value={item.score} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export const MemoizedWeeklyPerformance = memo(WeeklyPerformance)
