import { z } from 'zod'
import CryptoJS from 'crypto-js'

const ConversationEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  model: z.string(),
  prompt: z.string(),
  response: z.string(),
  tokensUsed: z.number(),
  cost: z.number()
})

export type ConversationEntry = z.infer<typeof ConversationEntrySchema>

export class HistoryService {
  private static readonly HISTORY_KEY = 'psiquiz-conversation-history'
  private static readonly MAX_ENTRIES = 100
  private static readonly SECRET_KEY = process.env.NEXT_PUBLIC_HISTORY_SECRET || 'history-secret'

  static add(entry: Omit<ConversationEntry, 'id' | 'timestamp'>): void {
    try {
      const fullEntry: ConversationEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      }

      const validated = ConversationEntrySchema.parse(fullEntry)
      const existing = this.getAll()
      const updated = [validated, ...existing].slice(0, this.MAX_ENTRIES)

      this.saveAll(updated)
    } catch (error) {
      console.error('Failed to add history entry:', error)
    }
  }

  static getAll(): ConversationEntry[] {
    try {
      const encrypted = localStorage.getItem(this.HISTORY_KEY)
      if (!encrypted) return []

      const bytes = CryptoJS.AES.decrypt(encrypted, this.SECRET_KEY)
      const decrypted = bytes.toString(CryptoJS.enc.Utf8)
      const parsed = JSON.parse(decrypted)

      return z.array(ConversationEntrySchema).parse(parsed)
    } catch (error) {
      console.warn('Failed to load history:', error)
      return []
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.HISTORY_KEY)
    } catch (error) {
      console.error('Failed to clear history:', error)
    }
  }

  private static saveAll(entries: ConversationEntry[]): void {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(entries),
        this.SECRET_KEY
      ).toString()

      localStorage.setItem(this.HISTORY_KEY, encrypted)
    } catch (error) {
      console.error('Failed to save history:', error)
    }
  }
}
