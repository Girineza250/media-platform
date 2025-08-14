import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ["/auth/signin", "/auth/signup", "/auth/error", "/api/auth", "/_next", "/favicon.ico", "/uploads"]

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  if (isPublicPath) {
    return NextResponse.next()
  }

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If no token and trying to access protected route, redirect to signin
  if (!token && pathname !== "/auth/signin") {
    const signInUrl = new URL("/auth/signin", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // If user has token but is on auth pages, redirect to home
  if (token && pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (uploaded files)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|uploads).*)",
  ],
}
