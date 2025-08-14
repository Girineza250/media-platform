import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function saveFile(file: File, type: "original" | "watermarked"): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uploadDir = path.join(process.cwd(), "uploads", type)

  // Ensure upload directory exists
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  const fileExtension = path.extname(file.name)
  const fileName = `${uuidv4()}${fileExtension}`
  const filePath = path.join(uploadDir, fileName)

  await writeFile(filePath, buffer)

  return `/uploads/${type}/${fileName}`
}

export function getFileType(filename: string): "image" | "video" | "unknown" {
  const ext = path.extname(filename).toLowerCase()

  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
  const videoExts = [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"]

  if (imageExts.includes(ext)) return "image"
  if (videoExts.includes(ext)) return "video"
  return "unknown"
}
