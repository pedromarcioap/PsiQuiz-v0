import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const UpdateStatsSchema = z.object({
  contentsProcessed: z.number().int().min(0).optional(),
  questionsGenerated: z.number().int().min(0).optional(),
  quizzesTaken: z.number().int().min(0).optional(),
  averageScore: z.number().min(0).max(100).optional(),
  totalTimeSpent: z.number().int().min(0).optional()
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      )
    }

    let stats = await prisma.userStatistics.findUnique({
      where: { userId: session.user.id },
    })

    if (!stats) {
      stats = await prisma.userStatistics.create({
        data: { 
          userId: session.user.id,
          contentsProcessed: 0,
          questionsGenerated: 0,
          quizzesTaken: 0,
          averageScore: 0,
          totalTimeSpent: 0
        },
      })
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching user statistics:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      )
    }

    const body = await req.json()
    const validatedData = UpdateStatsSchema.parse(body)

    const updatedStats = await prisma.userStatistics.upsert({
      where: { userId: session.user.id },
      update: validatedData,
      create: {
        userId: session.user.id,
        contentsProcessed: validatedData.contentsProcessed || 0,
        questionsGenerated: validatedData.questionsGenerated || 0,
        quizzesTaken: validatedData.quizzesTaken || 0,
        averageScore: validatedData.averageScore || 0,
        totalTimeSpent: validatedData.totalTimeSpent || 0,
      },
    })

    return NextResponse.json(updatedStats)
  } catch (error) {
    console.error("Error updating user statistics:", error)
    
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