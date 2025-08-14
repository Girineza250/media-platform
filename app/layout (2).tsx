import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/providers/session-provider"
import { Toaster } from "@/components/ui/toaster"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Media Platform",
  description: "Upload, watermark, and monetize your media content",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider session={session}>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}
