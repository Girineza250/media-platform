import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`
      SELECT 
        m.id as mediaId,
        m.title,
        m.description,
        m.watermarked_url as watermarkedUrl,
        m.original_url as originalUrl,
        m.media_type as mediaType,
        m.created_at as createdAt,
        m.price,
        m.file_size as fileSize,
        m.user_id = ${session.user.id} as isOwner,
        CASE 
          WHEN m.user_id = ${session.user.id} THEN true
          WHEN p.id IS NOT NULL THEN true
          ELSE false
        END as hasAccess
      FROM media m
      LEFT JOIN payments p ON m.id = p.media_id 
        AND p.user_id = ${session.user.id} 
        AND p.status = 'completed'
      ORDER BY m.created_at DESC
    `

    const media = result.map((item: any) => ({
      mediaId: item.mediaid,
      title: item.title,
      description: item.description || "",
      watermarkedUrl: item.watermarkedurl,
      originalUrl: item.originalurl,
      mediaType: item.mediatype,
      hasAccess: Boolean(item.hasaccess),
      createdAt: item.createdat,
      isOwner: Boolean(item.isowner),
      price: Number.parseFloat(item.price) || 0,
      fileSize: Number.parseInt(item.filesize) || 0,
    }))

    return NextResponse.json(media)
  } catch (error) {
    console.error("Error fetching user media:", error)
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 })
  }
}
