interface ConversationHistory {
  id: string
  timestamp: string
  model: string
  prompt: string
  response: string
  tokensUsed: number
  cost: number
}

export class AIHistoryManager {
  private enableLogging: boolean = false; // Será configurado pela AIService

  setLoggingStatus(enable: boolean) {
    this.enableLogging = enable;
  }

  saveToHistory(prompt: string, response: string, tokensUsed: number, cost: number, selectedModel: string) {
    if (!this.enableLogging) return

    const entry: ConversationHistory = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      model: selectedModel,
      prompt,
      response,
      tokensUsed,
      cost,
    }

    const existingHistory = JSON.parse(localStorage.getItem("psiquiz-conversation-history") || "[]")
    const updatedHistory = [entry, ...existingHistory].slice(0, 100)
    localStorage.setItem("psiquiz-conversation-history", JSON.stringify(updatedHistory))
  }

  getHistory(): ConversationHistory[] {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("psiquiz-conversation-history") || "[]");
  }

  clearHistory() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("psiquiz-conversation-history");
    }
  }
}

export const aiHistoryManager = new AIHistoryManager()