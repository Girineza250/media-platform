"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Download, Lock, Unlock, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MediaItem {
  id: string
  title: string
  mediaType: "image" | "video"
  watermarkedUrl: string
  originalUrl: string
  price: number
  uploadDate: string
  hasAccess: boolean
  isOwner: boolean
}

export function MediaGallery() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [payingFor, setPayingFor] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const response = await fetch("/api/media/list")
      if (response.ok) {
        const data = await response.json()
        setMedia(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load media",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = async (mediaId: string, price: number) => {
    setPayingFor(mediaId)

    try {
      const response = await fetch(`/api/media/${mediaId}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Payment Successful!",
          description: "You now have access to the original file",
        })
        fetchMedia() // Refresh the list
      } else {
        throw new Error(result.error || "Payment failed")
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setPayingFor(null)
    }
  }

  const handleDownload = async (mediaId: string, title: string) => {
    try {
      const response = await fetch(`/api/media/${mediaId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = title
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the file",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Media Gallery</h2>
        <Badge variant="secondary">{media.length} items</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gray-100">
              {item.mediaType === "image" ? (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
                  <img
                    src="/placeholder.svg?height=200&width=300"
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {!item.hasAccess && !item.isOwner && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 px-3 py-1 rounded">
                        <span className="text-gray-800 font-semibold text-sm">WATERMARK</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <Play className="h-12 w-12 text-purple-500" />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    VIDEO
                  </div>
                  {!item.hasAccess && !item.isOwner && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 px-3 py-1 rounded">
                        <span className="text-gray-800 font-semibold text-sm">WATERMARK</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="absolute top-2 right-2">
                <Badge variant={item.hasAccess || item.isOwner ? "default" : "secondary"}>
                  {item.hasAccess || item.isOwner ? (
                    <>
                      <Unlock className="h-3 w-3 mr-1" /> Unlocked
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" /> ${item.price}
                    </>
                  )}
                </Badge>
              </div>

              {item.isOwner && (
                <div className="absolute top-2 left-2">
                  <Badge variant="outline" className="bg-white">
                    Owner
                  </Badge>
                </div>
              )}
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription className="text-sm text-gray-500">
                Uploaded {new Date(item.uploadDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>

                {item.hasAccess || item.isOwner ? (
                  <Button size="sm" className="flex-1" onClick={() => handleDownload(item.id, item.title)}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleUnlock(item.id, item.price)}
                    disabled={payingFor === item.id}
                  >
                    {payingFor === item.id ? (
                      "Processing..."
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-1" />
                        Unlock ${item.price}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {media.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No media found</div>
          <p className="text-sm text-gray-400">Upload some media to get started</p>
        </div>
      )}
    </div>
  )
}
