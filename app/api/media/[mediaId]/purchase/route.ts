import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

// In-memory storage (replace with database)
const mediaStorage: any[] = []

export async function POST(request: NextRequest, { params }: { params: { mediaId: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mediaId } = params
    const { amount } = await request.json()
    const userId = (session.user as any).id

    const mediaItem = mediaStorage.find((item) => item.id === mediaId)

    if (!mediaItem) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    if (mediaItem.purchases.includes(userId)) {
      return NextResponse.json({ error: "Already purchased" }, { status: 400 })
    }

    // Simulate payment processing
    mediaItem.purchases.push(userId)

    return NextResponse.json({
      message: "Purchase successful",
      mediaId,
    })
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ error: "Purchase failed" }, { status: 500 })
  }
}
