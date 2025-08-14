import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { readFile } from "fs/promises"
import path from "path"

export async function GET(request: NextRequest, { params }: { params: { mediaId: string } }) {
  try {
    const { mediaId } = params
    const token = request.nextUrl.searchParams.get("token")
    const userId = request.headers.get("x-user-id") // In production, verify token

    if (!token || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user has access
    const accessResult = await sql`
      SELECT ma.unlocked, m.original_url, m.title, m.media_type
      FROM media_access ma
      JOIN media m ON ma.media_id = m.id
      WHERE ma.user_id = ${userId} AND ma.media_id = ${mediaId} AND ma.unlocked = true
    `

    if (accessResult.length === 0) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const media = accessResult[0]
    const filePath = path.join(process.cwd(), "public", media.original_url)

    try {
      const fileBuffer = await readFile(filePath)

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": media.media_type === "image" ? "image/jpeg" : "video/mp4",
          "Content-Disposition": `attachment; filename="${media.title}"`,
        },
      })
    } catch (fileError) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
