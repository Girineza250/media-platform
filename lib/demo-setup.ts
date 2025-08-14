import { sql } from "./db"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"

export async function createDemoUser() {
  try {
    // Check if demo user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = 'demo@example.com'
    `

    if (existingUser.length > 0) {
      console.log("Demo user already exists")
      return existingUser[0].id
    }

    // Create demo user
    const userId = uuidv4()
    const hashedPassword = await bcrypt.hash("demo123", 12)

    await sql`
      INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
      VALUES (${userId}, 'demo@example.com', ${hashedPassword}, 'Demo User', 'user', NOW(), NOW())
    `

    console.log("Demo user created successfully")
    return userId
  } catch (error) {
    console.error("Error creating demo user:", error)
    throw error
  }
}
