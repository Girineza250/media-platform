const { neon } = require("@neondatabase/serverless")
const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")
const fs = require("fs")
const path = require("path")

async function setupDevelopment() {
  console.log("🚀 Starting development setup...")

  // Check environment variables
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL environment variable is required")
    console.log("Please add DATABASE_URL to your .env.local file")
    process.exit(1)
  }

  if (!process.env.NEXTAUTH_SECRET) {
    console.error("❌ NEXTAUTH_SECRET environment variable is required")
    console.log("Please add NEXTAUTH_SECRET to your .env.local file")
    process.exit(1)
  }

  const sql = neon(process.env.DATABASE_URL)

  try {
    // Test database connection
    await sql`SELECT 1`
    console.log("✅ Database connection successful")

    console.log("📋 Creating database tables...")

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          full_name VARCHAR(255),
          role VARCHAR(50) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Create media table
    await sql`
      CREATE TABLE IF NOT EXISTS media (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          original_url VARCHAR(512) NOT NULL,
          watermarked_url VARCHAR(512) NOT NULL,
          media_type VARCHAR(20) NOT NULL,
          file_size BIGINT DEFAULT 0,
          price DECIMAL(10,2) DEFAULT 9.99,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Create payments table
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NOT NULL,
          media_id VARCHAR(36) NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'USD',
          status VARCHAR(20) DEFAULT 'pending',
          payment_method VARCHAR(100) DEFAULT 'demo',
          payment_date TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    console.log("✅ Database tables created successfully")

    console.log("👤 Creating demo users...")

    // Check if demo user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = 'user@example.com'
    `

    if (existingUser.length === 0) {
      const userId = uuidv4()
      const hashedPassword = await bcrypt.hash("user123", 12)

      await sql`
        INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
        VALUES (${userId}, 'user@example.com', ${hashedPassword}, 'Demo User', 'user', NOW(), NOW())
      `

      console.log("✅ Demo user created")
    } else {
      console.log("✅ Demo user already exists")
    }

    // Check if admin user exists
    const existingAdmin = await sql`
      SELECT id FROM users WHERE email = 'admin@example.com'
    `

    if (existingAdmin.length === 0) {
      const adminId = uuidv4()
      const hashedPassword = await bcrypt.hash("admin123", 12)

      await sql`
        INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
        VALUES (${adminId}, 'admin@example.com', ${hashedPassword}, 'Admin User', 'admin', NOW(), NOW())
      `

      console.log("✅ Admin user created")
    } else {
      console.log("✅ Admin user already exists")
    }

    // Create upload directories
    const uploadDirs = ["public/uploads", "public/uploads/originals", "public/uploads/watermarked"]

    uploadDirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        console.log(`✅ Created directory: ${dir}`)
      }
    })

    console.log("\n🎉 Development setup completed successfully!")
    console.log("\n📋 Test Credentials:")
    console.log("   👤 Demo User (Regular User):")
    console.log("   📧 Email: user@example.com")
    console.log("   🔑 Password: user123")
    console.log("\n   👑 Admin User (Can Upload Media):")
    console.log("   📧 Email: admin@example.com")
    console.log("   🔑 Password: admin123")
    console.log("\n🚀 Next steps:")
    console.log("   1. Run 'npm run dev' to start the development server")
    console.log("   2. Visit http://localhost:3000")
    console.log("   3. Sign in with one of the test accounts above")
  } catch (error) {
    console.error("❌ Development setup failed:", error)

    if (error.message.includes("connect")) {
      console.log("\n💡 Tips:")
      console.log("   - Check your DATABASE_URL is correct")
      console.log("   - Ensure your database is running and accessible")
      console.log("   - Verify network connectivity")
    }

    process.exit(1)
  }
}

setupDevelopment()
