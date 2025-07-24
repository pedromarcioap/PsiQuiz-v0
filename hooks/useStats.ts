import { useState, useEffect } from "react"
import { signOut, useSession } from "next-auth/react"

type Stats = {
  totalContent: number
  generatedQuizzes: number
  averageScore: number
  studyTime: number
  aiAccuracy: number
}

export default function useStats() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats>({
    totalContent: 0,
    generatedQuizzes: 0,
    averageScore: 0,
    studyTime: 0,
    aiAccuracy: 0,
  })

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
          }
        } catch (error) {
          console.error("Failed to fetch stats:", error)
        }
      }
    }

    fetchStats()
  }, [session])

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
      }
    }
  }

  return { stats, updateStats }
}
