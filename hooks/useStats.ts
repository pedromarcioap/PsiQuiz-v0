"use client"

import { useState, useEffect } from "react"

interface UserStats {
  totalContent: number
  generatedQuizzes: number
  averageScore: number
  studyTime: number
  aiAccuracy: number
  totalQuestions: number
  correctAnswers: number
}

interface QuizResult {
  id: string
  title: string
  score: number
  totalQuestions: number
  correctAnswers: number
  date: string
  timeSpent: number
  difficulty: string
  mode: "study" | "test"
}

export function useStats() {
  const [stats, setStats] = useState<UserStats>({
    totalContent: 0,
    generatedQuizzes: 0,
    averageScore: 0,
    studyTime: 0,
    aiAccuracy: 94,
    totalQuestions: 0,
    correctAnswers: 0,
  })

  const [quizResults, setQuizResults] = useState<QuizResult[]>([])

  useEffect(() => {
    loadStats()
    loadQuizResults()
  }, [])

  const loadStats = () => {
    const savedStats = localStorage.getItem("psiquiz-user-stats")
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }
  }

  const loadQuizResults = () => {
    const savedResults = localStorage.getItem("psiquiz-quiz-results")
    if (savedResults) {
      setQuizResults(JSON.parse(savedResults))
    }
  }

  const saveStats = (newStats: UserStats) => {
    setStats(newStats)
    localStorage.setItem("psiquiz-user-stats", JSON.stringify(newStats))
  }

  const addQuizResult = (result: Omit<QuizResult, "id" | "date">) => {
    const newResult: QuizResult = {
      ...result,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    }

    const updatedResults = [newResult, ...quizResults].slice(0, 50) // Manter apenas 50 resultados
    setQuizResults(updatedResults)
    localStorage.setItem("psiquiz-quiz-results", JSON.stringify(updatedResults))

    // Atualizar estatísticas gerais
    const newStats = {
      ...stats,
      generatedQuizzes: stats.generatedQuizzes + 1,
      totalQuestions: stats.totalQuestions + result.totalQuestions,
      correctAnswers: stats.correctAnswers + result.correctAnswers,
      studyTime: stats.studyTime + Math.round(result.timeSpent / 60), // converter para minutos
    }

    // Recalcular média
    newStats.averageScore = Math.round((newStats.correctAnswers / newStats.totalQuestions) * 100) || 0

    saveStats(newStats)
  }

  const incrementContentCount = () => {
    const newStats = { ...stats, totalContent: stats.totalContent + 1 }
    saveStats(newStats)
  }

  const getRecentActivity = () => {
    return quizResults.slice(0, 5).map((result) => ({
      id: result.id,
      type: "quiz" as const,
      title: result.title,
      score: result.score,
      mode: result.mode,
      date: new Date(result.date).toLocaleDateString(),
    }))
  }

  const getPerformanceByTopic = () => {
    const topicStats: { [key: string]: { correct: number; total: number; scores: number[] } } = {}

    quizResults.forEach((result) => {
      if (!topicStats[result.title]) {
        topicStats[result.title] = { correct: 0, total: 0, scores: [] }
      }
      topicStats[result.title].correct += result.correctAnswers
      topicStats[result.title].total += result.totalQuestions
      topicStats[result.title].scores.push(result.score)
    })

    return Object.entries(topicStats).map(([topic, data]) => ({
      topic,
      score: Math.round((data.correct / data.total) * 100) || 0,
      quizzes: data.scores.length,
      trend: data.scores.length > 1 ? (data.scores[0] > data.scores[data.scores.length - 1] ? "up" : "down") : "stable",
      difficulty: "Intermediário" as const, // Pode ser melhorado com dados reais
    }))
  }

  const clearAllData = () => {
    localStorage.removeItem("psiquiz-user-stats")
    localStorage.removeItem("psiquiz-quiz-results")
    setStats({
      totalContent: 0,
      generatedQuizzes: 0,
      averageScore: 0,
      studyTime: 0,
      aiAccuracy: 94,
      totalQuestions: 0,
      correctAnswers: 0,
    })
    setQuizResults([])
  }

  return {
    stats,
    quizResults,
    addQuizResult,
    incrementContentCount,
    getRecentActivity,
    getPerformanceByTopic,
    clearAllData,
    saveStats,
  }
}
