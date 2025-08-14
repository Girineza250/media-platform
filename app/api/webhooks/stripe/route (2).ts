import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { sql } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object

      // Update payment status
      await sql`
        UPDATE payments 
        SET status = 'completed', payment_date = NOW(), updated_at = NOW()
        WHERE id = ${paymentIntent.metadata.paymentId}
      `

      // Grant access
      const accessId = uuidv4()
      const payment = await sql`
        SELECT user_id, media_id FROM payments WHERE id = ${paymentIntent.metadata.paymentId}
      `

      if (payment.length > 0) {
        await sql`
          INSERT INTO media_access (id, user_id, media_id, unlocked, unlocked_at, created_at, updated_at)
          VALUES (${accessId}, ${payment[0].user_id}, ${payment[0].media_id}, true, NOW(), NOW(), NOW())
          ON CONFLICT (user_id, media_id) DO UPDATE SET
            unlocked = true,
            unlocked_at = NOW(),
            updated_at = NOW()
        `
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}
