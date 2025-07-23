import { generateQuestionsAI } from '@/app/actions/openrouter'
import { ConfigService, type AIConfig } from './config-service'
import { ModelService, type OpenRouterModel } from './model-service'
import { HistoryService } from './history-service'
import { z } from 'zod'

const GeneratedQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
  explanation: z.string(),
  difficulty: z.enum(["Básico", "Intermediário", "Avançado"]),
  topic: z.string(),
  distractorAnalysis: z.string()
})

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>

const GenerateQuestionsParamsSchema = z.object({
  topic: z.string().min(1),
  questionCount: z.number().min(1).max(50),
  difficulty: z.enum(["Básico", "Intermediário", "Avançado"]).optional(),
  context: z.string().optional()
})

export type GenerateQuestionsParams = z.infer<typeof GenerateQuestionsParamsSchema>

export class AIService {
  private config: AIConfig | null = null
  private models: OpenRouterModel[] = []

  constructor() {
    this.initialize()
  }

  private initialize(): void {
    if (typeof window !== 'undefined') {
      this.config = ConfigService.get()
      this.loadModels()
    }
  }

  private async loadModels(): Promise<void> {
    try {
      this.models = await ModelService.getAvailableModels()
    } catch (error) {
      console.error('Failed to load models:', error)
    }
  }

  async generateQuestions(params: GenerateQuestionsParams): Promise<GeneratedQuestion[]> {
    // Validate input parameters
    const validatedParams = GenerateQuestionsParamsSchema.parse(params)
    
    if (!this.isConfigured()) {
      throw new Error('AI service not configured. Please check model selection and API settings.')
    }

    const fullParams = {
      ...validatedParams,
      selectedModel: this.config!.selectedModel,
      maxTokens: this.config!.maxTokens,
      temperature: this.config!.temperature,
      systemPrompt: this.config!.systemPrompt
    }

    try {
      const result = await generateQuestionsAI(fullParams)

      if (!result.success || !result.questions) {
        throw new Error(result.error || 'Failed to generate questions')
      }

      // Validate response structure
      const validatedQuestions = z.array(GeneratedQuestionSchema).parse(result.questions)

      // Log to history if enabled
      if (this.config!.enableLogging) {
        const cost = ModelService.calculateCost(
          result.tokensUsed || 0,
          this.config!.selectedModel,
          this.models
        )

        HistoryService.add({
          model: this.config!.selectedModel,
          prompt: `Generate ${validatedParams.questionCount} questions about ${validatedParams.topic}`,
          response: JSON.stringify(validatedQuestions),
          tokensUsed: result.tokensUsed || 0,
          cost
        })
      }

      return validatedQuestions
    } catch (error) {
      console.error('AI generation failed:', error)
      if (error instanceof z.ZodError) {
        throw new Error('Invalid response format from AI service')
      }
      throw error
    }
  }

  async getAvailableModels(): Promise<OpenRouterModel[]> {
    this.models = await ModelService.getAvailableModels()
    return this.models
  }

  isConfigured(): boolean {
    return this.config !== null && ConfigService.isValid(this.config)
  }

  getConfig(): AIConfig | null {
    return this.config
  }

  updateConfig(newConfig: Partial<AIConfig>): void {
    const current = this.config || {
      selectedModel: '',
      systemPrompt: '',
      temperature: 0.7,
      maxTokens: 2000,
      enableLogging: true
    }

    const updated = { ...current, ...newConfig }
    ConfigService.save(updated)
    this.config = updated
  }

  getHistory(): ReturnType<typeof HistoryService.getAll> {
    return HistoryService.getAll()
  }

  clearHistory(): void {
    HistoryService.clear()
  }
}

export const aiService = new AIService()
