"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/forms/AuthForm"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"login" | "register">("login")

  const handleAuth = async (email: string, password: string) => {
    // TODO: Implement actual authentication logic
    console.log("Auth attempt:", { email, password, mode })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Redirect to dashboard on success
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background grid-pattern">
      <div className="absolute inset-0 gradient-bg" />
      <div className="relative z-10 w-full max-w-md px-4">
        <AuthForm mode={mode} onSubmit={handleAuth} onModeChange={setMode} />
      </div>
    </div>
  )
}
