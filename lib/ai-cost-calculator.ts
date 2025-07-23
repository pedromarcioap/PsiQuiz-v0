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

export class AICostCalculator {
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
}

export const aiCostCalculator = new AICostCalculator()