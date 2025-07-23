import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"
import { analyzePerformanceAI } from "@/app/actions/openrouter" // Importar analyzePerformanceAI

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

    // Mock de userAnswers e questions para a chamada de analyzePerformanceAI
    // Em um cenário real, estes dados viriam do frontend ou de um banco de dados
    const mockUserAnswers = [
      { questionId: "q1", selectedOption: 0 },
      { questionId: "q2", selectedOption: 2 },
      { questionId: "q3", selectedOption: 1 },
    ]
    const mockQuestions = [
      { question: "Q1", options: ["A", "B", "C"], correctAnswer: 0, difficulty: "Básico", explanation: "", topic: "", distractorAnalysis: "" },
      { question: "Q2", options: ["D", "E", "F"], correctAnswer: 1, difficulty: "Intermediário", explanation: "", topic: "", distractorAnalysis: "" },
      { question: "Q3", options: ["G", "H", "I"], correctAnswer: 1, difficulty: "Avançado", explanation: "", topic: "", distractorAnalysis: "" },
    ]

    // Chamar a Server Action analyzePerformanceAI
    const aiResult = await analyzePerformanceAI(mockUserAnswers, mockQuestions)

    if (!aiResult.success) {
      console.error("Erro ao gerar insights da IA:", aiResult.error)
      return new NextResponse(JSON.stringify({ error: aiResult.error }), { status: 500 })
    }

    // Retornar os insights gerados pela AI
    return new NextResponse(JSON.stringify(aiResult.insights), { status: 200 })
  } catch (error) {
    console.error("Erro ao gerar insights:", error)
    return new NextResponse(JSON.stringify({ error: "Erro ao gerar insights" }), { status: 500 })
  }
}