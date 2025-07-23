import { generateQuestionsAI, testOpenRouterConnection, analyzePerformanceAI } from "../app/actions/openrouter"
import { aiCostCalculator } from "./ai-cost-calculator"
import { aiHistoryManager } from "./ai-history-manager"

interface AIConfig {
  openrouterKeyInput?: string
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
  distractorAnalysis: string
}

interface OpenRouterModel {
  id: string
  name: string
  provider: {
    name: string
    id: string
  }
  pricing: {
    prompt: string
    completion: string
    unit: string
  }
}

export class AIService {
  private config: AIConfig | null = null
  private modelsCache: OpenRouterModel[] | null = null

  constructor() {
    if (typeof window !== "undefined") {
      const savedConfig = localStorage.getItem("psiquiz-api-config")
      if (savedConfig) {
        this.config = JSON.parse(savedConfig)
      }
    }
  }

  async generateQuestions(params: Parameters<typeof generateQuestionsAI>[0]): Promise<{ questions: GeneratedQuestion[] } | null> {
    if (!this.config?.selectedModel || !this.config?.maxTokens || !this.config?.temperature) {
      throw new Error("Configurações de IA incompletas. Verifique o modelo, maxTokens e temperatura.")
    }

    const fullParams = {
      ...params,
      selectedModel: this.config.selectedModel,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      systemPrompt: this.config.systemPrompt,
    }

    try {
      const result = await generateQuestionsAI(fullParams)

      if (result.success && result.questions) {
        const cost = aiCostCalculator.calculateCost(result.tokensUsed || 0, this.config.selectedModel, this.modelsCache || [])
        aiHistoryManager.setLoggingStatus(this.config.enableLogging);
        aiHistoryManager.saveToHistory(
          `Geração de ${params.questionCount} questões a partir do conteúdo fornecido`,
          JSON.stringify(result.questions),
          result.tokensUsed || 0,
          cost,
          this.config.selectedModel
        )
        return { questions: result.questions }
      } else {
        console.error("Erro ao gerar questões via Server Action:", result.error)
        throw new Error(result.error || "Erro desconhecido ao gerar questões.")
      }
    } catch (error: any) {
      console.error("Erro na chamada da Server Action generateQuestionsAI:", error)
      throw error
    }
  }

  async provideFeedback(questionId: string, feedback: "good" | "poor"): Promise<void> {
    console.log(`Feedback received for question ${questionId}: ${feedback}`)
    return Promise.resolve()
  }

  async getInsights(timeRange = "30d", topic = "all"): Promise<any[]> {
    console.warn(
      `[AIService] getInsights() is not yet fully implemented – returning a blank array (timeRange=${timeRange}, topic=${topic})`,
    )
    return []
  }

  async fetchAvailableModels(): Promise<OpenRouterModel[]> {
    if (this.modelsCache) {
      return this.modelsCache
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/models")
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`)
      }
      const data = await response.json()
      this.modelsCache = data.data.map((model: any) => {
        const providerId = typeof model.owned_by === "string" ? model.owned_by : (model.owned_by?.id ?? "unknown")
        const providerName = typeof model.owned_by === "string" ? model.owned_by : (model.owned_by?.name ?? providerId)

        return {
          id: model.id,
          name: model.name,
          provider: { id: providerId, name: providerName },
          pricing: {
            prompt: model.pricing.prompt,
            completion: model.pricing.completion,
            unit: model.pricing.unit,
          },
        } as OpenRouterModel
      })
      return this.modelsCache as OpenRouterModel[]
    } catch (error) {
      console.error("Error fetching OpenRouter models:", error)
      this.modelsCache = null;
      throw error
    }
  }

  isConfigured(): boolean {
    return !!this.config?.selectedModel
  }

  getConfig(): AIConfig | null {
    return this.config
  }

  updateConfig(newConfig: AIConfig) {
    this.config = { ...this.config, ...newConfig }
    if (typeof window !== "undefined") {
      localStorage.setItem("psiquiz-api-config", JSON.stringify(this.config))
    }
  }
}

export const aiService = new AIService()
