import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: "Não autorizado" }), { status: 401 })
  }

  try {
    const stats = await prisma.userStatistics.findUnique({
      where: { userId: session.user.id },
    })

    if (!stats) {
      return new NextResponse(JSON.stringify({ error: "Estatísticas não encontradas" }), { status: 404 })
    }

    const prompt = `
      Com base nas seguintes estatísticas de um usuário do PsiQuiz, gere 3-5 recomendações acionáveis e personalizadas para ajudar o usuário a melhorar seus estudos.
      As recomendações devem ser concisas e diretas.

      Estatísticas:
      - Quizzes Realizados: ${stats.quizzesTaken}
      - Média de Pontuação: ${stats.averageScore.toFixed(1)}%
      - Tempo Total de Estudo: ${(stats.totalTimeSpent / 3600).toFixed(1)} horas
      - Conteúdos Processados: ${stats.contentsProcessed}
      - Questões Geradas: ${stats.questionsGenerated}

      Formato da resposta: um array de strings JSON. Exemplo: ["Recomendação 1", "Recomendação 2"]
    `

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // Usando um modelo mais barato para insights
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      throw new Error(`Erro na API do OpenRouter: ${response.statusText}`)
    }

    const data = await response.json()
    const insights = JSON.parse(data.choices[0].message.content)

    return new NextResponse(JSON.stringify(insights), { status: 200 })
  } catch (error) {
    console.error("Erro ao gerar insights:", error)
    return new NextResponse(JSON.stringify({ error: "Erro ao gerar insights" }), { status: 500 })
  }
}