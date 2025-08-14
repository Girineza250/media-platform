import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

// In-memory storage (replace with database)
const mediaStorage: any[] = []

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const totalMedia = mediaStorage.length
    const totalUsers = 2 // Demo users
    const totalPurchases = mediaStorage.reduce((sum, item) => sum + item.purchases.length, 0)
    const totalRevenue = mediaStorage.reduce((sum, item) => sum + item.purchases.length * item.price, 0)

    const mediaStats = mediaStorage.map((item) => ({
      id: item.id,
      title: item.title,
      mediaType: item.mediaType,
      uploadDate: item.uploadDate,
      purchases: item.purchases.length,
      revenue: item.purchases.length * item.price,
    }))

    return NextResponse.json({
      stats: {
        totalMedia,
        totalUsers,
        totalRevenue,
        totalPurchases,
      },
      media: mediaStats,
    })
  } catch (error) {
    console.error("Stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
