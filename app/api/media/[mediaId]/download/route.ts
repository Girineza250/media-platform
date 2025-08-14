import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { readFile } from "fs/promises"
import path from "path"

// In-memory storage (replace with database)
const mediaStorage: any[] = []

export async function GET(request: NextRequest, { params }: { params: { mediaId: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mediaId } = params
    const userId = (session.user as any).id

    const mediaItem = mediaStorage.find((item) => item.id === mediaId)

    if (!mediaItem) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    const hasAccess = mediaItem.purchases.includes(userId) || mediaItem.uploaderId === userId

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Serve the original file
    const filePath = path.join(process.cwd(), "public", mediaItem.originalUrl)
    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mediaItem.mediaType === "image" ? "image/jpeg" : "video/mp4",
        "Content-Disposition": `attachment; filename="${mediaItem.title}"`,
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}
