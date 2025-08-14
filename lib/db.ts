import { neon } from "@neondatabase/serverless"

// Validate environment variable
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("❌ DATABASE_URL environment variable is not set")
  throw new Error("DATABASE_URL is required")
}

// Create SQL client with error handling
let sql: any

try {
  sql = neon(databaseUrl)
} catch (error) {
  console.error("❌ Failed to initialize database client:", error)
  throw new Error("Database initialization failed")
}

// Test connection function
export async function testConnection() {
  try {
    await sql`SELECT 1 as test`
    console.log("✅ Database connection successful")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

export { sql }
