import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import sharp from "sharp"

function getFileType(filename: string): "image" | "video" | "unknown" {
  const ext = filename.split(".").pop()?.toLowerCase()
  const imageExts = ["jpg", "jpeg", "png", "gif", "webp"]
  const videoExts = ["mp4", "avi", "mov", "wmv", "flv", "webm"]

  if (imageExts.includes(ext || "")) return "image"
  if (videoExts.includes(ext || "")) return "video"
  return "unknown"
}

// In-memory storage for demo (replace with database)
const mediaStorage: any[] = []

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const description = (formData.get("description") as string) || ""
    const price = Number.parseFloat(formData.get("price") as string) || 9.99

    if (!file || !title) {
      return NextResponse.json({ error: "File and title are required" }, { status: 400 })
    }

    const mediaId = uuidv4()
    const fileExtension = path.extname(file.name)
    const fileName = `${mediaId}${fileExtension}`

    // Create upload directories
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    const originalsDir = path.join(uploadsDir, "originals")
    const watermarkedDir = path.join(uploadsDir, "watermarked")

    for (const dir of [uploadsDir, originalsDir, watermarkedDir]) {
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true })
      }
    }

    // Save original file
    const originalPath = path.join(originalsDir, fileName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(originalPath, buffer)

    // Create watermarked version
    const watermarkedPath = path.join(watermarkedDir, fileName)
    const mediaType = file.type.startsWith("image/") ? "image" : "video"

    if (mediaType === "image") {
      // Add watermark to image
      const watermarkText = "WATERMARK"
      await sharp(buffer)
        .composite([
          {
            input: Buffer.from(`
            <svg width="200" height="50">
              <rect width="200" height="50" fill="rgba(0,0,0,0.7)" rx="5"/>
              <text x="100" y="30" font-family="Arial" font-size="16" fill="white" text-anchor="middle">${watermarkText}</text>
            </svg>
          `),
            gravity: "center",
          },
        ])
        .jpeg({ quality: 80 })
        .toFile(watermarkedPath)
    } else {
      // For video, just copy for now (in production, use FFmpeg)
      await writeFile(watermarkedPath, buffer)
    }

    // Store metadata
    const mediaItem = {
      id: mediaId,
      title,
      mediaType,
      originalUrl: `/uploads/originals/${fileName}`,
      watermarkedUrl: `/uploads/watermarked/${fileName}`,
      price,
      uploadDate: new Date().toISOString(),
      uploaderId: (session.user as any).id,
      purchases: [],
    }

    mediaStorage.push(mediaItem)

    return NextResponse.json({
      id: mediaId,
      message: "Media uploaded successfully",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
