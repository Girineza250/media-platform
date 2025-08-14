"use client"

import type React from "react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileVideo, FileImage, Loader2, DollarSign, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AdminMediaUpload({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("9.99")
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      setFile(droppedFile)
      if (!title) {
        setTitle(droppedFile.name.split(".")[0])
      }
    }
  }

  const handleUpload = async () => {
    if (!file || !title || !session?.user?.id) {
      toast({
        title: "Missing Information",
        description: "Please select a file, enter a title, and ensure you're signed in.",
        variant: "destructive",
      })
      return
    }

    if (session.user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "Only administrators can upload media.",
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
      formData.append("price", price)

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Upload Successful!",
          description: "Media has been uploaded and watermarked successfully.",
        })

        setFile(null)
        setTitle("")
        setDescription("")
        setPrice("9.99")

        const fileInput = document.getElementById("file-upload") as HTMLInputElement
        if (fileInput) fileInput.value = ""

        onUploadSuccess?.()
      } else {
        throw new Error(result.error || "Upload failed")
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An error occurred during upload.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = () => {
    if (!file) return <Upload className="h-12 w-12 text-gray-400" />

    const type = file.type.split("/")[0]
    if (type === "image") return <FileImage className="h-12 w-12 text-blue-500" />
    if (type === "video") return <FileVideo className="h-12 w-12 text-purple-500" />
    return <Upload className="h-12 w-12 text-gray-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  if (!session || session.user.role !== "admin") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">Only administrators can upload media content.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Upload className="h-6 w-6 text-blue-600" />
          Upload Media Content
        </CardTitle>
        <CardDescription className="text-gray-600">
          Upload images or videos that will be automatically watermarked for preview. Only administrators can upload
          content.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="file-upload" className="text-sm font-medium">
            Select Media File
          </Label>
          <div
            className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : file
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-40 cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {getFileIcon()}
                {file ? (
                  <div className="text-center mt-2">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                ) : (
                  <div className="text-center mt-2">
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Images: PNG, JPG, GIF (MAX. 10MB) | Videos: MP4, AVI, MOV (MAX. 100MB)
                    </p>
                  </div>
                )}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter media title"
              className="h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium">
              Price (USD) *
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="9.99"
                className="pl-10 h-10"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter media description (optional)"
            rows={3}
            className="resize-none"
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={uploading || !file || !title}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading & Processing...
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
