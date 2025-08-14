"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function AuthButton() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <Button
      variant="outline"
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  )
}
