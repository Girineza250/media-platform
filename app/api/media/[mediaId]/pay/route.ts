import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export const runtime = "nodejs"

export async function POST(request: NextRequest, { params }: { params: { mediaId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount } = await request.json()
    const { mediaId } = params

    // Check if media exists
    const mediaResult = await sql`
      SELECT id, price FROM media WHERE id = ${mediaId}
    `

    if (mediaResult.length === 0) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 })
    }

    const media = mediaResult[0]

    // Check if user already has access
    const existingPayment = await sql`
      SELECT id FROM payments 
      WHERE user_id = ${session.user.id} 
      AND media_id = ${mediaId} 
      AND status = 'completed'
    `

    if (existingPayment.length > 0) {
      return NextResponse.json({ error: "Already purchased" }, { status: 400 })
    }

    // For demo purposes, simulate successful payment
    const paymentId = uuidv4()
    await sql`
      INSERT INTO payments (id, user_id, media_id, amount, status, payment_method, created_at, updated_at)
      VALUES (${paymentId}, ${session.user.id}, ${mediaId}, ${amount}, 'completed', 'demo', NOW(), NOW())
    `

    return NextResponse.json({
      paymentId,
      message: "Payment successful",
    })
  } catch (error) {
    console.error("Payment error:", error)
    return NextResponse.json({ error: "Payment failed" }, { status: 500 })
  }
}
