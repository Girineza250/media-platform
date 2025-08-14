const { neon } = require("@neondatabase/serverless")
const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")

async function fixAuth() {
  console.log("🔧 Fixing authentication setup...")

  // Validate environment variables
  const requiredEnvVars = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"]
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:")
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`)
    })
    console.log("\nPlease add these to your .env.local file")
    return
  }

  console.log("✅ All required environment variables are set")

  try {
    const sql = neon(process.env.DATABASE_URL)

    // Test database connection
    console.log("🔗 Testing database connection...")
    await sql`SELECT 1`
    console.log("✅ Database connection successful")

    // Recreate users table with proper structure
    console.log("📋 Setting up users table...")
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create demo users with proper password hashes
    console.log("👤 Creating demo users...")

    // Demo user
    const demoUserId = uuidv4()
    const demoPasswordHash = await bcrypt.hash("user123", 12)

    await sql`
      INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
      VALUES (${demoUserId}, 'user@example.com', ${demoPasswordHash}, 'Demo User', 'user', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        password_hash = ${demoPasswordHash},
        updated_at = NOW()
    `

    // Admin user
    const adminUserId = uuidv4()
    const adminPasswordHash = await bcrypt.hash("admin123", 12)

    await sql`
      INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
      VALUES (${adminUserId}, 'admin@example.com', ${adminPasswordHash}, 'Admin User', 'admin', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        password_hash = ${adminPasswordHash},
        updated_at = NOW()
    `

    console.log("✅ Demo users created/updated successfully")

    // Test authentication
    console.log("🔐 Testing authentication...")
    const testUser = await sql`
      SELECT * FROM users WHERE email = 'user@example.com'
    `

    if (testUser.length > 0) {
      const isPasswordValid = await bcrypt.compare("user123", testUser[0].password_hash)
      if (isPasswordValid) {
        console.log("✅ Authentication test passed")
      } else {
        console.log("❌ Authentication test failed")
      }
    }

    console.log("\n🎉 Authentication setup completed!")
    console.log("\n📋 Test Credentials:")
    console.log("   👤 Demo User: user@example.com / user123")
    console.log("   👑 Admin User: admin@example.com / admin123")
    console.log("\n🚀 Next steps:")
    console.log("   1. Restart your development server: npm run dev")
    console.log("   2. Visit http://localhost:3000/auth/signin")
    console.log("   3. Test with the credentials above")
  } catch (error) {
    console.error("❌ Authentication setup failed:", error)

    if (error.message.includes("connect")) {
      console.log("\n💡 Database connection tips:")
      console.log("   - Verify your DATABASE_URL is correct")
      console.log("   - Check if your database is accessible")
      console.log("   - Ensure your IP is whitelisted (for cloud databases)")
    }
  }
}

fixAuth()
