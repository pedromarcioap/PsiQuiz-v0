import { generateQuestionsAI, testOpenRouterConnection, analyzePerformanceAI } from "../app/actions/openrouter"

interface AIConfig {
  openrouterKeyInput?: string // Para exibição temporária da entrada
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
  distractorAnalysis: string // Mantendo esta versão mais descritiva
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

  // Updated calculateCost to use dynamic model pricing
  calculateCost(tokens: number, modelId: string, availableModels: OpenRouterModel[]): number {
    const model = availableModels.find((m) => m.id === modelId)
    if (!model) {
      console.warn(`Model ${modelId} not found in available models for cost calculation. Using default.`)
      // Fallback to a default approximate cost if model not found
      return (tokens / 1000) * 0.001
    }

    const promptCostPerUnit = Number.parseFloat(model.pricing.prompt.replace("$", ""))
    const completionCostPerUnit = Number.parseFloat(model.pricing.completion.replace("$", ""))
    const unitMultiplier = model.pricing.unit.includes("M") ? 1000000 : 1000 // Convert '1M' to 1,000,000, '1K' to 1,000

    // Assuming tokens are split evenly between prompt and completion for simplicity
    // In a real scenario, you'd get input_tokens and output_tokens from the API response
    const cost = (tokens / unitMultiplier) * ((promptCostPerUnit + completionCostPerUnit) / 2)
    return cost
  }

  private saveToHistory(prompt: string, response: string, tokensUsed: number, cost: number) {
    if (!this.config?.enableLogging) return

    const entry: ConversationHistory = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      model: this.config.selectedModel,
      prompt,
      response,
      tokensUsed,
      cost, // Usar o custo calculado e passado
    }

    const existingHistory = JSON.parse(localStorage.getItem("psiquiz-conversation-history") || "[]")
    const updatedHistory = [entry, ...existingHistory].slice(0, 100)
    localStorage.setItem("psiquiz-conversation-history", JSON.stringify(updatedHistory))
  }

  // Este método agora chama a Server Action
  async generateQuestions(params: Parameters<typeof generateQuestionsAI>[0]): Promise<{ questions: GeneratedQuestion[] } | null> {
    if (!this.config?.selectedModel || !this.config?.maxTokens || !this.config?.temperature) {
      throw new Error("Configurações de IA incompletas. Verifique o modelo, maxTokens e temperatura.")
    }

    const fullParams = {
      ...params,
      selectedModel: this.config.selectedModel,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      systemPrompt: this.config.systemPrompt, // Garantir que o systemPrompt da config seja usado
    }

    try {
      const result = await generateQuestionsAI(fullParams)

      if (result.success && result.questions) {
        // Calcular o custo usando os modelos disponíveis e tokens usados
        const cost = this.calculateCost(result.tokensUsed || 0, this.config.selectedModel, this.modelsCache || [])
        this.saveToHistory(
          `Geração de ${params.questionCount} questões a partir do conteúdo fornecido`,
          JSON.stringify(result.questions),
          result.tokensUsed || 0,
          cost
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
    // Este método pode ser atualizado para chamar analyzePerformanceAI Server Action
    console.warn(
      `[AIService] getInsights() is not yet fully implemented – returning a blank array (timeRange=${timeRange}, topic=${topic})`,
    )
    // Exemplo de como chamar a Server Action para insights, se necessário
    // const result = await analyzePerformanceAI([], []);
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
      return this.modelsCache as OpenRouterModel[] // Asserção de tipo, pois já verificamos que não é null
    } catch (error) {
      console.error("Error fetching OpenRouter models:", error)
      this.modelsCache = null; // Resetar cache em caso de erro
      throw error
    }
  }

  isConfigured(): boolean {
    // Verifica se o objeto de configuração existe e se o modelo selecionado está presente
    return !!this.config?.selectedModel
  }

  getConfig(): AIConfig | null {
    return this.config
  }

  updateConfig(newConfig: AIConfig) {
    this.config = { ...this.config, ...newConfig }
    // Salvar no localStorage para persistência no cliente
    if (typeof window !== "undefined") {
      localStorage.setItem("psiquiz-api-config", JSON.stringify(this.config))
    }
  }
}

export const aiService = new AIService()
