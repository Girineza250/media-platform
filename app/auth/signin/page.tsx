import { SignInForm } from "@/components/auth/signin-form"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Media Platform</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}
