"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function AuthButton() {
  return (
    <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  )
}
