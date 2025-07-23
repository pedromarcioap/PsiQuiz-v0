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
    const content = await prisma.content.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(content)
  } catch (error) {
    console.error("Error fetching content:", error)
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
    const { title, source, type } = body

    if (!title || !type) {
      return new NextResponse("Missing title or type", { status: 400 })
    }

    const newContent = await prisma.content.create({
      data: {
        userId: session.user.id,
        title,
        source,
        type,
      },
    })

    return NextResponse.json(newContent, { status: 201 })
  } catch (error) {
    console.error("Error creating content:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
