interface AIConfig {
  openrouterKeyInput?: string // For temporary input display
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
  selectedModel: string // Added selectedModel to params
  maxTokens: number // Added maxTokens to params for server action
  temperature: number // Added temperature to params for server action
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

  private saveToHistory(prompt: string, response: string, tokensUsed: number) {
    if (!this.config?.enableLogging) return

    const entry: ConversationHistory = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      model: this.config.selectedModel,
      prompt,
      response,
      tokensUsed,
      cost: this.calculateCost(tokensUsed, this.config.selectedModel, this.modelsCache || []), // Use cached models for cost
    }

    const existingHistory = JSON.parse(localStorage.getItem("psiquiz-conversation-history") || "[]")
    const updatedHistory = [entry, ...existingHistory].slice(0, 100)
    localStorage.setItem("psiquiz-conversation-history", JSON.stringify(updatedHistory))
  }

  // This method now only prepares parameters and relies on a Server Action
  async generateQuestions(params: GenerationParams): Promise<{ questions: GeneratedQuestion[] } | null> {
    // This client-side method no longer makes the fetch call directly.
    // It's here for type consistency if other client components still call it,
    // but the actual API call is handled by the Server Action.
    // The `generateQuestionsAI` Server Action will be called directly from the UI.
    console.warn("AIService.generateQuestions should ideally be called via a Server Action.")
    return null // Or throw an error if direct client-side call is not intended
  }

  async provideFeedback(questionId: string, feedback: "good" | "poor"): Promise<void> {
    console.log(`Feedback received for question ${questionId}: ${feedback}`)
    return Promise.resolve()
  }

  async getInsights(timeRange = "30d", topic = "all"): Promise<any[]> {
    console.warn(
      `[AIService] getInsights() is not yet implemented – returning a blank array (timeRange=${timeRange}, topic=${topic})`,
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
        // `owned_by` can be a string or object; make it uniform
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
      return this.modelsCache
    } catch (error) {
      console.error("Error fetching OpenRouter models:", error)
      throw error
    }
  }

  private parseTextResponse(text: string): GeneratedQuestion[] {
    // Implementação básica para extrair questões de texto não-JSON
    // Esta é uma implementação simplificada - pode ser melhorada
    const questions: GeneratedQuestion[] = []

    // Lógica para parsear texto e extrair questões
    // Por enquanto, retorna array vazio se não conseguir parsear JSON

    return questions
  }

  isConfigured(): boolean {
    // This now checks if the client-side config object exists,
    // not if the API key is present on the client.
    return !!this.config
  }

  getConfig(): AIConfig | null {
    return this.config
  }

  updateConfig(newConfig: AIConfig) {
    // Update the entire config, including openrouterKeyInput for display persistence
    this.config = { ...this.config, ...newConfig }
  }
}

export const aiService = new AIService()
