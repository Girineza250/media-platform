import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`
      SELECT 
        m.*,
        ma.unlocked,
        ma.unlocked_at,
        CASE 
          WHEN m.user_id = ${session.user.id} THEN true
          ELSE COALESCE(ma.unlocked, false)
        END as has_access
      FROM media m
      LEFT JOIN media_access ma ON m.id = ma.media_id AND ma.user_id = ${session.user.id}
      ORDER BY m.created_at DESC
    `

    const media = result.map((item: any) => ({
      mediaId: item.id,
      title: item.title,
      description: item.description,
      watermarkedUrl: item.watermarked_url,
      originalUrl: item.has_access ? item.original_url : null,
      mediaType: item.media_type,
      hasAccess: item.has_access,
      createdAt: item.created_at,
      isOwner: item.user_id === session.user.id,
    }))

    return NextResponse.json(media)
  } catch (error) {
    console.error("Error fetching user media:", error)
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 })
  }
}
