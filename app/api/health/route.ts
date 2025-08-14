import { NextResponse } from "next/server"
import { testConnection } from "@/lib/db"

export async function GET() {
  try {
    const dbConnected = await testConnection()

    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbConnected ? "connected" : "disconnected",
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
