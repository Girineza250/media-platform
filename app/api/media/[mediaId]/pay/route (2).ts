import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sql } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest, { params }: { params: { mediaId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { mediaId } = params
    const { amount = 9.99 } = await request.json()

    const existingAccess = await sql`
      SELECT unlocked FROM media_access 
      WHERE user_id = ${session.user.id} AND media_id = ${mediaId} AND unlocked = true
    `

    if (existingAccess.length > 0) {
      return NextResponse.json({ error: "You already have access to this media" }, { status: 400 })
    }

    // Simulate payment processing
    const paymentId = uuidv4()
    const accessId = uuidv4()

    await sql`
      INSERT INTO payments (id, user_id, media_id, amount, currency, status, payment_date, created_at, updated_at)
      VALUES (${paymentId}, ${session.user.id}, ${mediaId}, ${amount}, 'USD', 'completed', NOW(), NOW(), NOW())
    `

    await sql`
      INSERT INTO media_access (id, user_id, media_id, unlocked, unlocked_at, created_at, updated_at)
      VALUES (${accessId}, ${session.user.id}, ${mediaId}, true, NOW(), NOW(), NOW())
      ON CONFLICT (user_id, media_id) DO UPDATE SET
        unlocked = true,
        unlocked_at = NOW(),
        updated_at = NOW()
    `

    return NextResponse.json({
      success: true,
      message: "Payment successful! You now have access to the original file.",
    })
  } catch (error) {
    console.error("Payment error:", error)
    return NextResponse.json({ error: "Payment failed" }, { status: 500 })
  }
}
