import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: "Não autorizado" }), { status: 401 })
  }

  try {
    const stats = await prisma.userStatistics.findUnique({
      where: { userId: session.user.id },
    })

    if (!stats) {
      // Se não houver estatísticas, crie uma entrada inicial
      const newStats = await prisma.userStatistics.create({
        data: { userId: session.user.id },
      })
      return new NextResponse(JSON.stringify(newStats), { status: 200 })
    }

    return new NextResponse(JSON.stringify(stats), { status: 200 })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Erro ao buscar estatísticas" }), { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: "Não autorizado" }), { status: 401 })
  }

  try {
    const body = await req.json()
    const { contentsProcessed, questionsGenerated, quizzesTaken, averageScore, totalTimeSpent } = body

    const updatedStats = await prisma.userStatistics.update({
      where: { userId: session.user.id },
      data: {
        contentsProcessed,
        questionsGenerated,
        quizzesTaken,
        averageScore,
        totalTimeSpent,
      },
    })

    return new NextResponse(JSON.stringify(updatedStats), { status: 200 })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Erro ao atualizar estatísticas" }), { status: 500 })
  }
}