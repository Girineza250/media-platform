"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "CredentialsSignin":
        return "Invalid email or password. Please try again."
      case "EmailCreateAccount":
        return "Could not create account with this email."
      case "OAuthCreateAccount":
        return "Could not create account with this provider."
      case "EmailSignin":
        return "Check your email for a sign in link."
      case "OAuthSignin":
        return "Error occurred during OAuth sign in."
      case "OAuthCallback":
        return "Error in OAuth callback."
      case "OAuthAccountNotLinked":
        return "Account not linked. Please sign in with the same provider you used originally."
      case "SessionRequired":
        return "Please sign in to access this page."
      default:
        return "An authentication error occurred. Please try again."
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">Authentication Error</CardTitle>
          <CardDescription className="text-gray-600">{getErrorMessage(error)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin">Try Again</Link>
          </Button>
          <Button variant="outline" asChild className="w-full bg-transparent">
            <Link href="/auth/signup">Create New Account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
