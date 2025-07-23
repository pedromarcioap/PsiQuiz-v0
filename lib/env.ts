import { z } from "zod"

const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY é necessária."),
  // Adicione outras variáveis de ambiente aqui conforme necessário
  // NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET é necessária."),
  // DATABASE_URL: z.string().url("DATABASE_URL deve ser uma URL válida."),
})

type Env = z.infer<typeof envSchema>

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}

export const env = envSchema.parse(process.env)