import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`
      SELECT 
        p.*,
        u.full_name as user_name,
        u.email as user_email,
        m.title as media_title
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN media m ON p.media_id = m.id
      WHERE p.status = 'completed'
      ORDER BY p.created_at DESC
      LIMIT 50
    `

    const payments = result.map((item: any) => ({
      id: item.id,
      amount: Number.parseFloat(item.amount) || 0,
      userName: item.user_name || "Unknown",
      userEmail: item.user_email || "Unknown",
      mediaTitle: item.media_title || "Unknown",
      createdAt: item.created_at,
      paymentMethod: item.payment_method || "demo",
    }))

    return NextResponse.json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}
