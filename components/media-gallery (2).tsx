"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Download, Lock, Unlock, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
      const response = await fetch("/api/media/user")

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

  const handleUnlock = async (mediaId: string) => {
    setPayingFor(mediaId)

    try {
      const response = await fetch(`/api/media/${mediaId}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 9.99,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Payment Successful!",
          description: "You now have access to the original file",
        })

        fetchMedia()
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
          <Card key={item.mediaId} className="overflow-hidden">
            <div className="relative h-48 bg-gray-100">
              {item.mediaType === "image" ? (
                <img
                  src="/placeholder.svg?height=200&width=300"
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
                  <Play className="h-12 w-12 text-gray-400" />
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    VIDEO
                  </div>
                </div>
              )}

              <div className="absolute top-2 right-2">
                <Badge variant={item.hasAccess ? "default" : "secondary"}>
                  {item.hasAccess ? (
                    <>
                      <Unlock className="h-3 w-3 mr-1" /> Unlocked
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" /> Locked
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
              {item.description && <CardDescription>{item.description}</CardDescription>}
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>

                {item.hasAccess || item.isOwner ? (
                  <Button size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleUnlock(item.mediaId)}
                    disabled={payingFor === item.mediaId}
                  >
                    {payingFor === item.mediaId ? (
                      "Processing..."
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-1" />
                        Unlock $9.99
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
