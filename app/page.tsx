"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MediaUpload } from "@/components/media-upload"
import { MediaGallery } from "@/components/media-gallery"
import { AdminDashboard } from "@/components/admin-dashboard"
import { AuthButton } from "@/components/auth-button"
import { Upload, GalleryThumbnailsIcon as Gallery, Settings, Shield } from "lucide-react"

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) return null

  const isAdmin = session.user.role === "admin"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Media Platform</h1>
              {isAdmin && (
                <div className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  <Shield className="h-3 w-3 inline mr-1" />
                  Admin
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {session.user.name}</span>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="gallery" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Gallery className="h-4 w-4" />
              Gallery
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="gallery">
            <MediaGallery />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="upload">
              <MediaUpload />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="admin">
              <AdminDashboard />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
