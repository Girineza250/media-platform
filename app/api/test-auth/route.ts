import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Test if auth options are properly configured
    const hasProviders = authOptions.providers && authOptions.providers.length > 0
    const hasSecret = !!process.env.NEXTAUTH_SECRET
    const hasUrl = !!process.env.NEXTAUTH_URL

    return NextResponse.json({
      status: "Auth configuration test",
      hasProviders,
      hasSecret,
      hasUrl,
      providersCount: authOptions.providers?.length || 0,
    })
  } catch (error) {
    console.error("Auth test failed:", error)
    return NextResponse.json(
      { error: "Auth configuration failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
