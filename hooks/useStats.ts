"use client"

/**
 * Client-only stats helper.
 * 1. Avoids touching `localStorage` on the server.
 * 2. Exposes increment helpers used across the app.
 */

import { useCallback, useEffect, useState } from "react"

type Stats = {
  contentsProcessed: number
  questionsGenerated: number
}

type QuizResult = {
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

const STORAGE_KEY = "psiquiz_stats"

function readFromStorage(): Stats {
  if (typeof window === "undefined") return { contentsProcessed: 0, questionsGenerated: 0 }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Stats) : { contentsProcessed: 0, questionsGenerated: 0 }
  } catch {
    return { contentsProcessed: 0, questionsGenerated: 0 }
  }
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(() => readFromStorage())

  const [quizResults, setQuizResults] = useState<QuizResult[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const raw = window.localStorage.getItem("psiquiz_quiz_results")
      return raw ? (JSON.parse(raw) as QuizResult[]) : []
    } catch {
      return []
    }
  })

  /* ------------------------------------------------------------------ */
  /*  Sync with localStorage – runs only in the browser                 */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
    } catch {
      /* ignore quota / disabled storage errors */
    }
  }, [stats])

  /* ------------------------------------------------------------------ */
  /*  Increment helpers                                                 */
  /* ------------------------------------------------------------------ */
  const incrementContentsProcessed = useCallback(() => {
    setStats((s) => ({ ...s, contentsProcessed: s.contentsProcessed + 1 }))
  }, [])

  const incrementQuestionsGenerated = useCallback((qty: number) => {
    setStats((s) => ({ ...s, questionsGenerated: s.questionsGenerated + qty }))
  }, [])

  const addQuizResult = useCallback(
    (result: Omit<QuizResult, "id" | "date">) => {
      const full: QuizResult = {
        ...result,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      }

      const updated = [full, ...quizResults].slice(0, 50)
      setQuizResults(updated)

      try {
        window.localStorage.setItem("psiquiz_quiz_results", JSON.stringify(updated))
      } catch {
        /* ignore quota errors */
      }

      // quick aggregate stats update
      setStats((s) => ({
        ...s,
        questionsGenerated: s.questionsGenerated + full.totalQuestions,
      }))
    },
    [quizResults],
  )

  return {
    ...stats,
    incrementContentsProcessed,
    incrementQuestionsGenerated,
    addQuizResult,
    quizResults,
  }
}
