"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, FileVideo, DollarSign, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminStats {
  totalMedia: number
  totalUsers: number
  totalRevenue: number
  totalPurchases: number
}

interface MediaStats {
  id: string
  title: string
  mediaType: string
  uploadDate: string
  purchases: number
  revenue: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalMedia: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalPurchases: 0,
  })
  const [mediaStats, setMediaStats] = useState<MediaStats[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setMediaStats(data.media)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load statistics",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm("Are you sure you want to delete this media?")) return

    try {
      const response = await fetch(`/api/admin/media/${mediaId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Media deleted successfully",
        })
        fetchStats()
      } else {
        throw new Error("Failed to delete media")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Media</CardTitle>
            <FileVideo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMedia}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPurchases}</div>
          </CardContent>
        </Card>
      </div>

      {/* Media Management */}
      <Card>
        <CardHeader>
          <CardTitle>Media Management</CardTitle>
          <CardDescription>Manage uploaded media and view performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mediaStats.map((media) => (
              <div key={media.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{media.title}</h4>
                  <div className="flex items-center gap-4 mt-1">
                    <Badge variant="outline">{media.mediaType}</Badge>
                    <span className="text-sm text-gray-500">{new Date(media.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right mr-4">
                  <p className="font-semibold">${media.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{media.purchases} purchases</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteMedia(media.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {mediaStats.length === 0 && <div className="text-center py-8 text-gray-500">No media uploaded yet</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
