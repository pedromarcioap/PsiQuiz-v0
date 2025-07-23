import { z } from 'zod'

const OpenRouterModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.object({
    name: z.string(),
    id: z.string()
  }),
  pricing: z.object({
    prompt: z.string(),
    completion: z.string(),
    unit: z.string()
  })
})

export type OpenRouterModel = z.infer<typeof OpenRouterModelSchema>

export class ModelService {
  private static cache: {
    models: OpenRouterModel[]
    timestamp: number
  } | null = null
  
  private static readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private static readonly API_URL = 'https://openrouter.ai/api/v1/models'

  static async getAvailableModels(): Promise<OpenRouterModel[]> {
    if (this.isCacheValid()) {
      return this.cache!.models
    }

    try {
      const response = await fetch(this.API_URL, {
        headers: {
          'Content-Type': 'application/json'
        },
        // Add timeout
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const models = this.normalizeModels(data.data || [])
      
      this.cache = {
        models,
        timestamp: Date.now()
      }

      return models
    } catch (error) {
      console.error('Failed to fetch models:', error)
      // Return cached data if available, otherwise empty array
      return this.cache?.models || []
    }
  }

  static calculateCost(
    tokens: number, 
    modelId: string, 
    models: OpenRouterModel[]
  ): number {
    if (typeof tokens !== 'number' || tokens < 0) return 0

    const model = models.find(m => m.id === modelId)
    if (!model) return 0

    try {
      const promptCost = parseFloat(model.pricing.prompt.replace('$', ''))
      const completionCost = parseFloat(model.pricing.completion.replace('$', ''))
      const unitMultiplier = model.pricing.unit.includes('M') ? 1_000_000 : 1_000

      // Assume 50/50 split between prompt and completion tokens
      return (tokens / unitMultiplier) * ((promptCost + completionCost) / 2)
    } catch {
      return 0
    }
  }

  private static isCacheValid(): boolean {
    return this.cache !== null && 
           (Date.now() - this.cache.timestamp) < this.CACHE_TTL
  }

  private static normalizeModels(rawModels: any[]): OpenRouterModel[] {
    return rawModels
      .map(model => {
        try {
          return OpenRouterModelSchema.parse({
            id: model.id,
            name: model.name,
            provider: {
              id: typeof model.owned_by === 'string' ? model.owned_by : model.owned_by?.id || 'unknown',
              name: typeof model.owned_by === 'string' ? model.owned_by : model.owned_by?.name || 'Unknown'
            },
            pricing: model.pricing
          })
        } catch {
          return null
        }
      })
      .filter((model): model is OpenRouterModel => model !== null)
  }
}
