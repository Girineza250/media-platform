import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    await sql`SELECT 1`
    return NextResponse.json({ status: "Database connection successful" })
  } catch (error) {
    console.error("Database test failed:", error)
    return NextResponse.json(
      { error: "Database connection failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
