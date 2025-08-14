"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Download, Lock, Unlock, Eye, Star, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, formatDate } from "@/lib/utils"

interface MediaItem {
  mediaId: string
  title: string
  description: string
  watermarkedUrl: string
  originalUrl: string | null
  mediaType: "image" | "video"
  hasAccess: boolean
  createdAt: string
  isOwner: boolean
  price: number
  fileSize: number
}

export function UserMediaGallery() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [payingFor, setPayingFor] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const response = await fetch("/api/media/user")

      if (response.ok) {
        const data = await response.json()
        setMedia(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load media content.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = async (mediaId: string, price: number) => {
    setPayingFor(mediaId)

    try {
      const response = await fetch(`/api/media/${mediaId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: price,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Payment Successful! 🎉",
          description: "You now have access to the original high-quality file.",
        })

        fetchMedia()
      } else {
        throw new Error(result.error || "Payment failed")
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An error occurred during payment.",
        variant: "destructive",
      })
    } finally {
      setPayingFor(null)
    }
  }

  const handleDownload = (mediaId: string, title: string) => {
    const downloadUrl = `/api/media/download/${mediaId}?token=demo-token`
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = title
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredMedia = media.filter((item) => {
    if (filter === "unlocked") return item.hasAccess
    if (filter === "locked") return !item.hasAccess
    return true
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Media Gallery</h2>
        </div>
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Media Gallery
          </h2>
          <p className="text-gray-600 mt-1">Discover and unlock premium media content</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="h-8"
          >
            All ({media.length})
          </Button>
          <Button
            variant={filter === "unlocked" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unlocked")}
            className="h-8"
          >
            <Unlock className="h-3 w-3 mr-1" />
            Unlocked ({media.filter((m) => m.hasAccess).length})
          </Button>
          <Button
            variant={filter === "locked" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("locked")}
            className="h-8"
          >
            <Lock className="h-3 w-3 mr-1" />
            Locked ({media.filter((m) => !m.hasAccess).length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedia.map((item) => (
          <Card key={item.mediaId} className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
            <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
              {item.mediaType === "image" ? (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center relative">
                  <img
                    src="/placeholder.svg?height=200&width=300"
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {!item.hasAccess && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg">
                        <span className="text-gray-800 font-semibold">PREVIEW</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <Play className="h-16 w-16 text-purple-500 opacity-80" />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                    VIDEO
                  </div>
                  {!item.hasAccess && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg">
                        <span className="text-gray-800 font-semibold">PREVIEW</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="absolute top-3 right-3">
                <Badge variant={item.hasAccess ? "default" : "secondary"} className="shadow-sm">
                  {item.hasAccess ? (
                    <>
                      <Unlock className="h-3 w-3 mr-1" /> Unlocked
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" /> {formatCurrency(item.price)}
                    </>
                  )}
                </Badge>
              </div>

              <div className="absolute top-3 left-3">
                <Badge variant="outline" className="bg-white/90 text-xs">
                  <Star className="h-3 w-3 mr-1 text-yellow-500" />
                  Premium
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
              {item.description && <CardDescription className="line-clamp-2">{item.description}</CardDescription>}
              <div className="flex items-center text-xs text-gray-500 mt-2">
                <Clock className="h-3 w-3 mr-1" />
                {formatDate(item.createdAt)}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>

                {item.hasAccess ? (
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleDownload(item.mediaId, item.title)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => handleUnlock(item.mediaId, item.price)}
                    disabled={payingFor === item.mediaId}
                  >
                    {payingFor === item.mediaId ? (
                      "Processing..."
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-1" />
                        Unlock {formatCurrency(item.price)}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMedia.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === "all" ? "No media found" : `No ${filter} media found`}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {filter === "all"
              ? "There's no media content available yet. Check back later for new uploads!"
              : `You don't have any ${filter} media. ${filter === "locked" ? "Unlock some content to get started!" : "Purchase some media to see it here!"}`}
          </p>
        </div>
      )}
    </div>
  )
}
