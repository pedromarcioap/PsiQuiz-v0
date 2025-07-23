import { callOpenRouterApi } from "@/lib/openrouter-api"
import { z } from "zod"
"use server"

const GeneratedQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
  explanation: z.string(),
  difficulty: z.union([z.literal("Básico"), z.literal("Intermediário"), z.literal("Avançado")]),
  topic: z.string(),
  distractorAnalysis: z.string(),
})

const GeneratedQuestionsResponseSchema = z.object({
  questions: z.array(GeneratedQuestionSchema),
})

type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>

interface GenerationParams {
  rawText: string
  systemPrompt: string
  questionCount: number
  difficulty: string
  distractorQuality: string
  selectedModel: string
  maxTokens: number
  temperature: number
}

// Server Action to test OpenRouter API connection
export async function testOpenRouterConnection(model: string) {
  const result = await callOpenRouterApi({
    model: model,
    messages: [
      {
        role: "user",
        content: "Teste de conexão. Responda apenas 'Conexão estabelecida com sucesso!'",
      },
    ],
    max_tokens: 50,
    temperature: 0.1,
  })

  if (result.success) {
    return { success: true, message: result.data.choices[0]?.message?.content || "Conexão estabelecida com sucesso!" }
  } else {
    return { success: false, error: result.error }
  }
}

// Server Action to generate questions
export async function generateQuestionsAI(params: GenerationParams) {
  // Helper: remove ```json fences & grab the first {...} block
  const extractJson = (raw: string): string => {
    let text = raw.trim()

    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "")
    }

    const first = text.indexOf("{")
    const last = text.lastIndexOf("}")
    return first !== -1 && last !== -1 ? text.slice(first, last + 1) : text
  }

  const prompt = `${params.systemPrompt}

CONTEÚDO PARA ANÁLISE:
${params.rawText}

Gere ${params.questionCount} questões de múltipla escolha baseadas no conteúdo acima.
DIFICULDADE: ${params.difficulty}
QUALIDADE DOS DISTRATORES: ${params.distractorQuality}

FORMATO DE SAÍDA (JSON):
{
  "questions": [
    {
      "question": "Pergunta clara e específica",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Explicação detalhada",
      "difficulty": "Básico|Intermediário|Avançado",
      "topic": "Área específica da psicologia",
      "distractorAnalysis": "Explicação dos distratores usados"
    }
  ]
}`

  const result = await callOpenRouterApi({
    model: params.selectedModel,
    messages: [{ role: "user", content: prompt }],
    max_tokens: params.maxTokens,
    temperature: params.temperature,
  })

  if (!result.success) {
    return { success: false, error: result.error }
  }

  try {
    const rawContent = result.data.choices?.[0]?.message?.content || ""
    const cleaned = extractJson(rawContent)

    const parsed = GeneratedQuestionsResponseSchema.safeParse(JSON.parse(cleaned))

    if (!parsed.success) {
      console.error("Erro de validação do esquema Zod:", parsed.error)
      return {
        success: false,
        error: "A IA retornou um formato inválido ou incompleto. Tente novamente ou ajuste o System Prompt.",
      }
    }

    return {
      success: true,
      questions: parsed.data.questions,
      tokensUsed: result.data.usage?.total_tokens || 0,
    }
  } catch (err) {
    console.error("Error parsing or validating JSON response from AI:", err)
    return {
      success: false,
      error: "A IA retornou um formato inválido. Tente novamente ou ajuste o System Prompt.",
    }
  }
}

// Server Action for performance analysis (placeholder for now)
export async function analyzePerformanceAI(userAnswers: any[], questions: GeneratedQuestion[]) {
  // Implementação básica para simular insights de desempenho
  // Em um cenário real, esta função faria uma chamada à API da IA para analisar as respostas do usuário
  // em relação às questões e gerar insights.

  const correctAnswers = userAnswers.filter((answer, index) => {
    const question = questions[index]
    return question && answer.selectedOption === question.correctAnswer
  }).length

  const overallScore = (correctAnswers / questions.length) * 100

  const insights = {
    overallScore: overallScore,
    weakAreas: ["Tópico A", "Tópico B"], // Placeholder para áreas fracas
    distractorVulnerabilities: ["Distrator X", "Distrator Y"], // Placeholder para vulnerabilidades de distratores
    recommendations: [
      "Revise os conceitos de Tópico A.",
      "Preste mais atenção aos distratores em questões de Tópico B.",
      "Pratique mais com questões de dificuldade Intermediária.",
    ],
    studyPlan: [
      "Dia 1: Estudo aprofundado de Tópico A.",
      "Dia 2: Resolução de exercícios sobre Tópico B.",
      "Dia 3: Revisão geral e simulado.",
    ],
  }

  // Simular uso de tokens
  const tokensUsed = Math.floor(Math.random() * 1000) + 100 // Entre 100 e 1100 tokens

  console.warn("analyzePerformanceAI Server Action: Implementação básica concluída.")
  return {
    success: true,
    insights: insights,
    tokensUsed: tokensUsed,
  }
}
