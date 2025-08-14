import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { mediaId: string } }) {
  try {
    const { mediaId } = params
    const userId = request.headers.get("x-user-id") // In production, get from auth session

    // Get media info
    const mediaResult = await sql`
      SELECT * FROM media WHERE id = ${mediaId}
    `

    if (mediaResult.length === 0) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    const media = mediaResult[0]

    // Check if user has access to original
    let hasAccess = false
    if (userId) {
      const accessResult = await sql`
        SELECT unlocked FROM media_access 
        WHERE user_id = ${userId} AND media_id = ${mediaId} AND unlocked = true
      `
      hasAccess = accessResult.length > 0
    }

    return NextResponse.json({
      mediaId: media.id,
      title: media.title,
      description: media.description,
      watermarkedUrl: media.watermarked_url,
      originalUrl: hasAccess ? media.original_url : null,
      mediaType: media.media_type,
      hasAccess,
    })
  } catch (error) {
    console.error("Error fetching media:", error)
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 })
  }
}
