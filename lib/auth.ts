import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { sql } from "./db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials")
            return null
          }

          console.log("Attempting to authenticate user:", credentials.email)

          // Test database connection first
          await sql`SELECT 1`

          const users = await sql`
            SELECT * FROM users WHERE email = ${credentials.email}
          `

          if (users.length === 0) {
            console.log("User not found")
            return null
          }

          const user = users[0]
          console.log("User found:", user.email)

          // If no password hash exists, create one (for demo users)
          if (!user.password_hash) {
            console.log("Creating password hash for user")
            const hashedPassword = await bcrypt.hash(credentials.password, 12)
            await sql`
              UPDATE users SET password_hash = ${hashedPassword} WHERE id = ${user.id}
            `
            user.password_hash = hashedPassword
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash)

          if (!isPasswordValid) {
            console.log("Invalid password")
            return null
          }

          console.log("Authentication successful")
          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            role: user.role,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
