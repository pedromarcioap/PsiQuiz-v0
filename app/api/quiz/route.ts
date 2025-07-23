import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const quizzes = await prisma.quiz.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        content: true,
        questions: true,
      },
    })
    return NextResponse.json(quizzes)
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, contentId, questions } = body

    if (!title || !questions) {
      return new NextResponse("Missing title or questions", { status: 400 })
    }

    const newQuiz = await prisma.quiz.create({
      data: {
        userId: session.user.id,
        title,
        contentId,
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            options: q.options,
          })),
        },
      },
      include: {
        questions: true,
      },
    })

    return NextResponse.json(newQuiz, { status: 201 })
  } catch (error) {
    console.error("Error creating quiz:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
