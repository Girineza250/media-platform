console.log("🧪 Testing minimal setup...")

// Check environment variables
const requiredVars = ["NEXTAUTH_SECRET", "NEXTAUTH_URL"]
const missingVars = requiredVars.filter((varName) => !process.env[varName])

if (missingVars.length > 0) {
  console.error("❌ Missing environment variables:")
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`)
  })
  console.log("\nPlease add these to your .env.local file:")
  console.log("NEXTAUTH_SECRET=your-secret-key")
  console.log("NEXTAUTH_URL=http://localhost:3000")
} else {
  console.log("✅ All required environment variables are set")
}

console.log("\n📋 Demo Credentials:")
console.log("👤 User: user@example.com / user123")
console.log("👑 Admin: admin@example.com / admin123")

console.log("\n🚀 Next steps:")
console.log("1. Make sure your .env.local has NEXTAUTH_SECRET and NEXTAUTH_URL")
console.log("2. Run: npm run dev")
console.log("3. Visit: http://localhost:3000/auth/signin")
console.log("4. Test with demo credentials above")
