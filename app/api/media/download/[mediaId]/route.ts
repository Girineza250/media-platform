import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { mediaId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mediaId } = params

    // Check if user has access to this media
    const result = await sql`
      SELECT 
        m.original_url,
        m.title,
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
      WHERE m.id = ${mediaId}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    const media = result[0]

    if (!media.hasaccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // For demo purposes, return a success message
    // In production, you would serve the actual file
    return NextResponse.json({
      message: "Download would start here",
      filename: media.title,
      url: media.original_url,
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
