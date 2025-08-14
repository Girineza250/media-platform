import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"
import { watermarkImage } from "@/lib/watermark"
import { saveFile, getFileType } from "@/lib/file-storage"
import { v4 as uuidv4 } from "uuid"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "admin") {
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

    const fileType = getFileType(file.name)
    if (fileType === "unknown") {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    // Save original file
    const originalUrl = await saveFile(file, "originals")
    let watermarkedUrl: string

    if (fileType === "image") {
      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const watermarkedBuffer = await watermarkImage(buffer, process.env.WATERMARK_TEXT || "PREVIEW")

        // Create a new File object from the watermarked buffer
        const watermarkedFile = new File([watermarkedBuffer], file.name, { type: file.type })
        watermarkedUrl = await saveFile(watermarkedFile, "watermarked")
      } catch (error) {
        console.error("Watermarking failed:", error)
        watermarkedUrl = originalUrl
      }
    } else {
      // For videos, just copy to watermarked folder for now
      watermarkedUrl = await saveFile(file, "watermarked")
    }

    const mediaId = uuidv4()
    await sql`
      INSERT INTO media (id, user_id, title, description, original_url, watermarked_url, media_type, price, file_size, created_at, updated_at)
      VALUES (${mediaId}, ${session.user.id}, ${title}, ${description}, ${originalUrl}, ${watermarkedUrl}, ${fileType}, ${price}, ${file.size}, NOW(), NOW())
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
