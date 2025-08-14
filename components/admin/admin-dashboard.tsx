"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, formatFileSize } from "@/lib/utils"
import { Users, DollarSign, FileImage, ShoppingCart, TrendingUp, Calendar } from "lucide-react"

interface AdminStats {
  totalMedia: number
  totalUsers: number
  totalRevenue: number
  totalPurchases: number
}

interface MediaItem {
  id: string
  title: string
  uploader: string
  mediaType: "image" | "video"
  createdAt: string
  totalPurchases: number
  revenue: number
  price: number
  fileSize: number
}

interface Payment {
  id: string
  amount: number
  userName: string
  userEmail: string
  mediaTitle: string
  createdAt: string
  paymentMethod: string
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalMedia: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalPurchases: 0,
  })
  const [media, setMedia] = useState<MediaItem[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, mediaRes, paymentsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/media"),
        fetch("/api/admin/payments"),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (mediaRes.ok) {
        const mediaData = await mediaRes.json()
        setMedia(mediaData)
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h2>
        <p className="text-gray-600 mt-1">Overview of your media platform performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Media</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalMedia}</p>
              </div>
              <FileImage className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Users</p>
                <p className="text-3xl font-bold text-green-900">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Total Purchases</p>
                <p className="text-3xl font-bold text-orange-900">{stats.totalPurchases}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Media Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Media Performance
            </CardTitle>
            <CardDescription>Top performing media content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {media.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-1">{item.title}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.mediaType}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatFileSize(item.fileSize)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(item.revenue)}</p>
                    <p className="text-xs text-gray-500">{item.totalPurchases} sales</p>
                  </div>
                </div>
              ))}
              {media.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileImage className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No media uploaded yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Payments
            </CardTitle>
            <CardDescription>Latest customer purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-1">{payment.mediaTitle}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">{payment.userName}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{formatDate(payment.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-green-600">{formatCurrency(payment.amount)}</p>
                    <Badge variant="outline" className="text-xs">
                      {payment.paymentMethod}
                    </Badge>
                  </div>
                </div>
              ))}
              {payments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No payments received yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
