import { z } from 'zod'
import CryptoJS from 'crypto-js'

const AIConfigSchema = z.object({
  selectedModel: z.string().min(1),
  systemPrompt: z.string(),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(1).max(32000),
  enableLogging: z.boolean()
})

export type AIConfig = z.infer<typeof AIConfigSchema>

export class ConfigService {
  private static readonly CONFIG_KEY = 'psiquiz-api-config'
  private static readonly SECRET_KEY = process.env.NEXT_PUBLIC_CONFIG_SECRET || 'default-secret'

  static get(): AIConfig | null {
    try {
      const encrypted = localStorage.getItem(this.CONFIG_KEY)
      if (!encrypted) return null

      const bytes = CryptoJS.AES.decrypt(encrypted, this.SECRET_KEY)
      const decrypted = bytes.toString(CryptoJS.enc.Utf8)
      const parsed = JSON.parse(decrypted)
      
      return AIConfigSchema.parse(parsed)
    } catch (error) {
      console.warn('Failed to load config:', error)
      return null
    }
  }

  static save(config: AIConfig): void {
    try {
      const validated = AIConfigSchema.parse(config)
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(validated), 
        this.SECRET_KEY
      ).toString()
      
      localStorage.setItem(this.CONFIG_KEY, encrypted)
    } catch (error) {
      console.error('Failed to save config:', error)
      throw new Error('Invalid configuration data')
    }
  }

  static isValid(config: any): config is AIConfig {
    try {
      AIConfigSchema.parse(config)
      return true
    } catch {
      return false
    }
  }
}
