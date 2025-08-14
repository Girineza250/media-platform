"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileVideo, FileImage, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function MediaUpload() {
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (!title) {
        setTitle(selectedFile.name.split(".")[0])
      }
    }
  }

  const handleUpload = async () => {
    if (!file || !title || !session?.user?.id) {
      toast({
        title: "Error",
        description: "Please select a file and enter a title",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title)
      formData.append("description", description)

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Media uploaded and watermarked successfully",
        })

        setFile(null)
        setTitle("")
        setDescription("")

        const fileInput = document.getElementById("file-upload") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = () => {
    if (!file) return <Upload className="h-8 w-8" />

    const type = file.type.split("/")[0]
    if (type === "image") return <FileImage className="h-8 w-8" />
    if (type === "video") return <FileVideo className="h-8 w-8" />
    return <Upload className="h-8 w-8" />
  }

  if (!session) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <p>Please sign in to upload media.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Media
        </CardTitle>
        <CardDescription>Upload images or videos. They will be automatically watermarked for preview.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select File</Label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {getFileIcon()}
                <p className="mb-2 text-sm text-gray-500">{file ? file.name : "Click to upload or drag and drop"}</p>
                <p className="text-xs text-gray-500">
                  Images: PNG, JPG, GIF (MAX. 10MB) | Videos: MP4, AVI, MOV (MAX. 100MB)
                </p>
              </div>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter media title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter media description (optional)"
            rows={3}
          />
        </div>

        <Button onClick={handleUpload} disabled={uploading || !file || !title} className="w-full">
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading & Watermarking...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
