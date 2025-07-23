import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const quizId = params.id

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    })

    if (!quiz || quiz.userId !== session.user.id) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const body = await request.json()
    const { score, timeTaken, answers } = body

    if (score === undefined || timeTaken === undefined || !answers) {
      return new NextResponse("Missing score, timeTaken, or answers", { status: 400 })
    }

    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        score,
        timeTaken,
        completedAt: new Date(),
      },
    })

    // Update individual questions with user answers
    for (const answer of answers) {
      await prisma.question.update({
        where: { id: answer.questionId },
        data: {
          userAnswer: answer.userAnswer,
          isCorrect: answer.isCorrect,
        },
      })
    }

    return NextResponse.json(updatedQuiz)
  } catch (error) {
    console.error(`Error updating quiz ${quizId}:`, error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
