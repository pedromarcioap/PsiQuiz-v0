interface AIConfig {
  openrouterKey: string
  selectedModel: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  enableLogging: boolean
}

interface GeneratedQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: "Básico" | "Intermediário" | "Avançado"
  topic: string
  distractorQuality: number
}

interface ConversationHistory {
  id: string
  timestamp: string
  model: string
  prompt: string
  response: string
  tokensUsed: number
  cost: number
}

interface GenerationParams {
  topic: string
  subtopics: string
  questionCount: number
  difficulty: string
  distractorComplexity: number
  useAdversarialTraining: boolean
  includeWebSearch: boolean
  systemPrompt: string
}

export class AIService {
  private config: AIConfig | null = null

  constructor() {
    if (typeof window !== "undefined") {
      const savedConfig = localStorage.getItem("psiquiz-api-config")
      if (savedConfig) {
        this.config = JSON.parse(savedConfig)
      }
    }
  }

  private calculateCost(tokens: number, model: string): number {
    const costPer1kTokens: { [key: string]: number } = {
      "openai/gpt-4o": 0.005,
      "openai/gpt-4o-mini": 0.00015,
      "anthropic/claude-3.5-sonnet": 0.003,
      "google/gemini-pro-1.5": 0.0035,
      "meta-llama/llama-3.1-70b-instruct": 0.00059,
      "mistralai/mistral-large": 0.003,
    }

    return (tokens / 1000) * (costPer1kTokens[model] || 0.001)
  }

  private saveToHistory(prompt: string, response: string, tokensUsed: number) {
    if (!this.config?.enableLogging) return

    const entry: ConversationHistory = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      model: this.config.selectedModel,
      prompt,
      response,
      tokensUsed,
      cost: this.calculateCost(tokensUsed, this.config.selectedModel),
    }

    const existingHistory = JSON.parse(localStorage.getItem("psiquiz-conversation-history") || "[]")
    const updatedHistory = [entry, ...existingHistory].slice(0, 100)
    localStorage.setItem("psiquiz-conversation-history", JSON.stringify(updatedHistory))
  }

  async generateQuestions(params: GenerationParams): Promise<{ questions: GeneratedQuestion[] } | null> {
    if (!this.config?.openrouterKey) {
      throw new Error("API key não configurada. Vá para Configurações > API.")
    }

    const prompt = `${params.systemPrompt}

TÓPICO: ${params.topic}
SUBTÓPICOS: ${params.subtopics}

Gere ${params.questionCount} questões de múltipla escolha. Dificuldade: ${params.difficulty}.`

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.openrouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "PsiQuiz AI",
        },
        body: JSON.stringify({
          model: this.config.selectedModel,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0]?.message?.content

      if (this.config.enableLogging) {
        this.saveToHistory(`Geração de ${params.questionCount} questões`, aiResponse, data.usage?.total_tokens || 0)
      }

      try {
        const parsed = JSON.parse(aiResponse)
        return parsed
      } catch (e) {
        console.log("Error parsing JSON response", e)
        return null
      }
    } catch (error) {
      console.error("Erro ao gerar questões:", error)
      throw error
    }
  }

  async provideFeedback(questionId: string, feedback: "good" | "poor"): Promise<void> {
    console.log(`Feedback received for question ${questionId}: ${feedback}`)
    return Promise.resolve()
  }

  async getInsights(timeRange: string, selectedTopic: string): Promise<any[]> {
    console.log(`Getting insights for time range ${timeRange} and topic ${selectedTopic}`)
    return Promise.resolve([])
  }

  isConfigured(): boolean {
    return !!this.config?.openrouterKey
  }

  getConfig(): AIConfig | null {
    return this.config
  }

  updateConfig(newConfig: AIConfig) {
    this.config = newConfig
  }
}

export const aiService = new AIService()
