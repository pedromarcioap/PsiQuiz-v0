"use client"

/**
 * Client-only stats helper.
 * 1. Avoids touching `localStorage` on the server.
 * 2. Exposes increment helpers used across the app.
 */

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"

type Stats = {
  contentsProcessed: number
  questionsGenerated: number
  quizzesTaken: number
  averageScore: number
  totalTimeSpent: number
}

export function useStats() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)

  const fetchStats = useCallback(async () => {
    if (!session) return
    try {
      const response = await fetch("/api/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }, [session])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const updateStats = async (newStats: Partial<Stats>) => {
    if (!session) return
    try {
      const response = await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStats),
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to update stats:", error)
    }
  }

  const incrementContentsProcessed = useCallback(() => {
    if (!stats) return
    updateStats({ contentsProcessed: stats.contentsProcessed + 1 })
  }, [stats])

  const incrementQuestionsGenerated = useCallback(
    (qty: number) => {
      if (!stats) return
      updateStats({ questionsGenerated: stats.questionsGenerated + qty })
    },
    [stats],
  )

  const addQuizResult = useCallback(
    (result: { score: number; timeSpent: number; totalQuestions: number }) => {
      if (!stats) return

      const newQuizzesTaken = stats.quizzesTaken + 1
      const newTotalTimeSpent = stats.totalTimeSpent + result.timeSpent
      const newAverageScore =
        (stats.averageScore * stats.quizzesTaken + result.score) / newQuizzesTaken

      updateStats({
        quizzesTaken: newQuizzesTaken,
        totalTimeSpent: newTotalTimeSpent,
        averageScore: newAverageScore,
        questionsGenerated: stats.questionsGenerated + result.totalQuestions,
      })
    },
    [stats],
  )

  return {
    stats,
    incrementContentsProcessed,
    incrementQuestionsGenerated,
    addQuizResult,
  }
}
