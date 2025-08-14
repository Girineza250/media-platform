import { put, del } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"

export async function uploadToBlob(file: File, folder: string): Promise<string> {
  try {
    const fileExtension = file.name.split(".").pop()
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`

    const blob = await put(fileName, file, {
      access: "public",
    })

    return blob.url
  } catch (error) {
    console.error("Blob upload error:", error)
    throw new Error("Failed to upload file")
  }
}

export async function deleteFromBlob(url: string): Promise<void> {
  try {
    await del(url)
  } catch (error) {
    console.error("Blob delete error:", error)
    throw new Error("Failed to delete file")
  }
}

export function getFileType(filename: string): "image" | "video" | "unknown" {
  const ext = filename.split(".").pop()?.toLowerCase()

  const imageExts = ["jpg", "jpeg", "png", "gif", "webp"]
  const videoExts = ["mp4", "avi", "mov", "wmv", "flv", "webm"]

  if (imageExts.includes(ext || "")) return "image"
  if (videoExts.includes(ext || "")) return "video"
  return "unknown"
}
