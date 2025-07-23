import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const CreateQuizSchema = z.object({
  title: z.string().min(1).max(200),
  contentId: z.string().optional(),
  questions: z.array(z.object({
    text: z.string().min(1).max(1000),
    options: z.array(z.string()).min(2).max(6),
    correctAnswer: z.number().int().min(0),
    explanation: z.string().optional(),
    difficulty: z.enum(["Básico", "Intermediário", "Avançado"]).optional(),
    topic: z.string().optional()
  })).min(1).max(50)
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const skip = (page - 1) * limit

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          content: {
            select: {
              id: true,
              title: true,
              type: true
            }
          },
          questions: {
            select: {
              id: true,
              text: true,
              options: true
            }
          },
          _count: {
            select: {
              questions: true
            }
          }
        },
      }),
      prisma.quiz.count({
        where: { userId: session.user.id }
      })
    ])

    return NextResponse.json({
      quizzes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = CreateQuizSchema.parse(body)

    // Validate content ownership if contentId provided
    if (validatedData.contentId) {
      const content = await prisma.content.findFirst({
        where: {
          id: validatedData.contentId,
          userId: session.user.id
        }
      })

      if (!content) {
        return NextResponse.json(
          { error: "Content not found or access denied" }, 
          { status: 404 }
        )
      }
    }

    // Validate correct answers are within options bounds
    for (const question of validatedData.questions) {
      if (question.correctAnswer >= question.options.length) {
        return NextResponse.json(
          { error: "Invalid correct answer index" }, 
          { status: 400 }
        )
      }
    }

    const newQuiz = await prisma.quiz.create({
      data: {
        userId: session.user.id,
        title: validatedData.title,
        contentId: validatedData.contentId,
        questions: {
          create: validatedData.questions.map((q) => ({
            text: q.text,
            options: {
              options: q.options,
              correct: q.correctAnswer,
              explanation: q.explanation,
              difficulty: q.difficulty,
              topic: q.topic
            },
          })),
        },
      },
      include: {
        questions: true,
        content: {
          select: {
            id: true,
            title: true,
            type: true
          }
        }
      },
    })

    return NextResponse.json(newQuiz, { status: 201 })
  } catch (error) {
    console.error("Error creating quiz:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors }, 
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}
