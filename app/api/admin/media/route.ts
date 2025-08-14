import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`
      SELECT 
        m.*,
        u.full_name as uploader,
        COUNT(p.id) as total_purchases,
        COALESCE(SUM(p.amount), 0) as revenue
      FROM media m
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN payments p ON m.id = p.media_id AND p.status = 'completed'
      GROUP BY m.id, u.full_name
      ORDER BY m.created_at DESC
    `

    const media = result.map((item: any) => ({
      id: item.id,
      title: item.title,
      uploader: item.uploader || "Unknown",
      mediaType: item.media_type,
      createdAt: item.created_at,
      totalPurchases: Number.parseInt(item.total_purchases) || 0,
      revenue: Number.parseFloat(item.revenue) || 0,
      price: Number.parseFloat(item.price) || 0,
      fileSize: Number.parseInt(item.file_size) || 0,
    }))

    return NextResponse.json(media)
  } catch (error) {
    console.error("Error fetching admin media:", error)
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 })
  }
}
