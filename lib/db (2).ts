import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required")
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL environment variable is required")
  }
}

const sql = neon(process.env.DATABASE_URL || "")

export async function testConnection() {
  try {
    await sql`SELECT 1`
    console.log("Database connection successful")
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

export { sql }

export type User = {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  updated_at: string
}

export type Media = {
  id: string
  user_id: string
  title: string
  description: string
  original_url: string
  watermarked_url: string
  media_type: string
  created_at: string
  updated_at: string
}

export type Payment = {
  id: string
  user_id: string
  media_id: string
  amount: number
  currency: string
  status: string
  payment_date: string
  created_at: string
  updated_at: string
}

export type MediaAccess = {
  id: string
  user_id: string
  media_id: string
  unlocked: boolean
  unlocked_at: string | null
  created_at: string
  updated_at: string
}
