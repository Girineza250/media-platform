import { writeFile, mkdir, unlink } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function saveFile(file: File, folder: string): Promise<string> {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), "public", "uploads", folder)

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const fileExtension = path.extname(file.name)
    const fileName = `${uuidv4()}${fileExtension}`
    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)

    return `/uploads/${folder}/${fileName}`
  } catch (error) {
    console.error("File save error:", error)
    throw new Error("Failed to save file")
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), "public", filePath)
    if (existsSync(fullPath)) {
      await unlink(fullPath)
    }
  } catch (error) {
    console.error("File delete error:", error)
    throw new Error("Failed to delete file")
  }
}

export function getFileType(filename: string): "image" | "video" | "unknown" {
  const ext = path.extname(filename).toLowerCase()

  const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
  const videoExts = [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"]

  if (imageExts.includes(ext)) return "image"
  if (videoExts.includes(ext)) return "video"
  return "unknown"
}
