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

  return { ...stats, incrementContentsProcessed, incrementQuestionsGenerated }
}
