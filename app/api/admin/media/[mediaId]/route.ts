import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { unlink } from "fs/promises"
import path from "path"

// In-memory storage (replace with database)
const mediaStorage: any[] = []

export async function DELETE(request: NextRequest, { params }: { params: { mediaId: string } }) {
  try {
    const session = await getServerSession()

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mediaId } = params
    const mediaIndex = mediaStorage.findIndex((item) => item.id === mediaId)

    if (mediaIndex === -1) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    const mediaItem = mediaStorage[mediaIndex]

    // Delete files
    try {
      await unlink(path.join(process.cwd(), "public", mediaItem.originalUrl))
      await unlink(path.join(process.cwd(), "public", mediaItem.watermarkedUrl))
    } catch (error) {
      console.error("File deletion error:", error)
    }

    // Remove from storage
    mediaStorage.splice(mediaIndex, 1)

    return NextResponse.json({ message: "Media deleted successfully" })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
