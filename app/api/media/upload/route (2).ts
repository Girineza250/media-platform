import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"
import { watermarkImage } from "@/lib/watermark"
import { v4 as uuidv4 } from "uuid"

function getFileType(filename: string): "image" | "video" | "unknown" {
  const ext = filename.split(".").pop()?.toLowerCase()
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp"]
  const videoExts = ["mp4", "avi", "mov", "wmv", "flv", "webm"]

  if (imageExts.includes(ext || "")) return "image"
  if (videoExts.includes(ext || "")) return "video"
  return "unknown"
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = (formData.get("description") as string) || ""

    if (!file || !title) {
      return NextResponse.json({ error: "File and title are required" }, { status: 400 })
    }

    const fileType = getFileType(file.name)
    if (fileType === "unknown") {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    // For demo purposes, create mock URLs
    const fileName = `${uuidv4()}-${file.name}`
    const originalUrl = `/uploads/originals/${fileName}`
    let watermarkedUrl: string

    if (fileType === "image") {
      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const watermarkedBuffer = await watermarkImage(buffer, process.env.WATERMARK_TEXT || "PREVIEW")
        watermarkedUrl = `/uploads/watermarked/${fileName}`
      } catch (error) {
        console.error("Watermarking failed:", error)
        watermarkedUrl = originalUrl
      }
    } else {
      watermarkedUrl = `/uploads/watermarked/${fileName}`
    }

    const mediaId = uuidv4()
    await sql`
      INSERT INTO media (id, user_id, title, description, original_url, watermarked_url, media_type, created_at, updated_at)
      VALUES (${mediaId}, ${session.user.id}, ${title}, ${description}, ${originalUrl}, ${watermarkedUrl}, ${fileType}, NOW(), NOW())
    `

    return NextResponse.json({
      mediaId,
      watermarkedUrl,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
