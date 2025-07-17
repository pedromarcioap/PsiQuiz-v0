"use server"

interface GenerationParams {
  topic: string
  subtopics: string
  questionCount: number
  difficulty: string
  distractorComplexity: number
  useAdversarialTraining: boolean
  includeWebSearch: boolean
  systemPrompt: string
  selectedModel: string
  maxTokens: number // Added maxTokens to params
  temperature: number // Added temperature to params
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

// Server Action to test OpenRouter API connection
export async function testOpenRouterConnection(model: string) {
  const openrouterKey = process.env.OPENROUTER_API_KEY

  if (!openrouterKey) {
    return { success: false, error: "OPENROUTER_API_KEY não configurada no ambiente do servidor." }
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://psiquiz-ai.vercel.app", // Use a fixed referer for server-side calls
        "X-Title": "PsiQuiz AI Server",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: "Teste de conexão. Responda apenas 'Conexão estabelecida com sucesso!'",
          },
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return { success: true, message: data.choices[0]?.message?.content || "Conexão estabelecida com sucesso!" }
    } else {
      const errorData = await response.json()
      console.error("OpenRouter API Error:", errorData)
      return {
        success: false,
        error: `Erro na API OpenRouter: ${response.status} - ${errorData.message || "Erro desconhecido"}`,
      }
    }
  } catch (error: any) {
    console.error("Server Action test connection failed:", error)
    return { success: false, error: `Falha na conexão do servidor: ${error.message}` }
  }
}

// Server Action to generate questions
export async function generateQuestionsAI(params: GenerationParams) {
  const openrouterKey = process.env.OPENROUTER_API_KEY
  if (!openrouterKey) {
    return {
      success: false,
      error: "OPENROUTER_API_KEY não configurada no ambiente do servidor.",
    }
  }

  // Helper: remove \`\`\`json fences & grab the first {...} block
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
TÓPICO: ${params.topic}
SUBTÓPICOS: ${params.subtopics}

Gere ${params.questionCount} questões de múltipla escolha baseadas no conteúdo acima. Varie os níveis de dificuldade e use diferentes estratégias de distratores.

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

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://psiquiz-ai.vercel.app",
        "X-Title": "PsiQuiz AI Server",
      },
      body: JSON.stringify({
        model: params.selectedModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: params.maxTokens,
        temperature: params.temperature,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("OpenRouter API Error:", errorData)
      return {
        success: false,
        error: `Erro na API OpenRouter: ${response.status} - ${errorData.message || "Erro desconhecido"}`,
      }
    }

    const data = await response.json()
    const rawContent = data.choices?.[0]?.message?.content || ""
    const cleaned = extractJson(rawContent)

    const parsed = JSON.parse(cleaned) as { questions: GeneratedQuestion[] }
    return {
      success: true,
      questions: parsed.questions,
      tokensUsed: data.usage?.total_tokens || 0,
    }
  } catch (err) {
    console.error("Error parsing JSON response from AI:", err)
    return {
      success: false,
      error: "A IA retornou um formato inválido. Tente novamente ou ajuste o System Prompt.",
    }
  }
}

// Server Action for performance analysis (placeholder for now)
export async function analyzePerformanceAI(userAnswers: any[], questions: GeneratedQuestion[]) {
  const openrouterKey = process.env.OPENROUTER_API_KEY

  if (!openrouterKey) {
    return { success: false, error: "OPENROUTER_API_KEY não configurada no ambiente do servidor." }
  }

  // This is a placeholder. You'd implement the actual AI call here.
  console.warn("analyzePerformanceAI Server Action is a placeholder.")
  return {
    success: true,
    insights: {
      overallScore: 0,
      weakAreas: [],
      distractorVulnerabilities: [],
      recommendations: [],
      studyPlan: [],
    },
    tokensUsed: 0,
  }
}
