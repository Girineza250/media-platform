import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

// In-memory storage (replace with database)
const mediaStorage: any[] = []

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any).id

    const mediaList = mediaStorage.map((item) => ({
      id: item.id,
      title: item.title,
      mediaType: item.mediaType,
      watermarkedUrl: item.watermarkedUrl,
      originalUrl: item.originalUrl,
      price: item.price,
      uploadDate: item.uploadDate,
      hasAccess: item.purchases.includes(userId),
      isOwner: item.uploaderId === userId,
    }))

    return NextResponse.json(mediaList)
  } catch (error) {
    console.error("List error:", error)
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 })
  }
}
