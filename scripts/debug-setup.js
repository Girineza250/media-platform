const { neon } = require("@neondatabase/serverless")

async function debugSetup() {
  console.log("🔍 Debugging setup...")

  // Check environment variables
  console.log("Environment variables:")
  console.log("- DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Missing")
  console.log("- NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing")
  console.log("- NEXTAUTH_URL:", process.env.NEXTAUTH_URL ? "✅ Set" : "❌ Missing")

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is missing")
    return
  }

  try {
    const sql = neon(process.env.DATABASE_URL)

    // Test basic connection
    console.log("\n🔗 Testing database connection...")
    await sql`SELECT 1`
    console.log("✅ Database connection successful")

    // Check if tables exist
    console.log("\n📋 Checking database tables...")

    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    console.log(
      "Tables found:",
      tables.map((t) => t.table_name),
    )

    // Check users table
    try {
      const userCount = await sql`SELECT COUNT(*) as count FROM users`
      console.log(`✅ Users table exists with ${userCount[0].count} users`)
    } catch (error) {
      console.log("❌ Users table missing or inaccessible")
    }

    // Check media table
    try {
      const mediaCount = await sql`SELECT COUNT(*) as count FROM media`
      console.log(`✅ Media table exists with ${mediaCount[0].count} media items`)
    } catch (error) {
      console.log("❌ Media table missing or inaccessible")
    }

    // Check payments table
    try {
      const paymentCount = await sql`SELECT COUNT(*) as count FROM payments`
      console.log(`✅ Payments table exists with ${paymentCount[0].count} payments`)
    } catch (error) {
      console.log("❌ Payments table missing or inaccessible")
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)
  }
}

debugSetup()
