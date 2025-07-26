"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Brain } from "lucide-react"

interface Activity {
  id: number
  type: "content" | "quiz"
  title: string
  questions?: number
  score?: number
  mode?: string
  date: string
}

interface RecentActivityProps {
  activities: Activity[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
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
  )
}

export const MemoizedRecentActivity = memo(RecentActivity)
