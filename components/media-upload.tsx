"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileVideo, FileImage, Loader2, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function MediaUpload() {
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("9.99")
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
    if (!file || !title || session?.user?.role !== "admin") {
      toast({
        title: "Error",
        description: "Please select a file, enter a title, and ensure you have admin access.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title)
      formData.append("price", price)

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
        setPrice("9.99")

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
    if (!file) return <Upload className="h-12 w-12 text-gray-400" />
    const type = file.type.split("/")[0]
    if (type === "image") return <FileImage className="h-12 w-12 text-blue-500" />
    if (type === "video") return <FileVideo className="h-12 w-12 text-purple-500" />
    return <Upload className="h-12 w-12 text-gray-400" />
  }

  if (session?.user?.role !== "admin") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Only administrators can upload media.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Media</CardTitle>
        <CardDescription>Upload images or videos. They will be automatically watermarked for preview.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select File</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center">
                {getFileIcon()}
                {file ? (
                  <div className="mt-2">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">Images: PNG, JPG, GIF | Videos: MP4, AVI, MOV</p>
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter media title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
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
