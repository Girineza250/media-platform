import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MediaUpload } from "@/components/media-upload"
import { MediaGallery } from "@/components/media-gallery"
import { AdminDashboard } from "@/components/admin-dashboard"
import { Upload, GalleryThumbnailsIcon as Gallery, Settings } from "lucide-react"
import { AuthButton } from "@/components/auth-button"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Media Platform</h1>
            <p className="text-lg text-gray-600">Upload, watermark, and monetize your media content</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {session.user?.name}</span>
            <AuthButton />
          </div>
        </div>

        <Tabs defaultValue="gallery" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Gallery className="h-4 w-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            {session.user?.role === "admin" && (
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="gallery">
            <MediaGallery />
          </TabsContent>

          <TabsContent value="upload">
            <MediaUpload />
          </TabsContent>

          {session.user?.role === "admin" && (
            <TabsContent value="admin">
              <AdminDashboard />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
