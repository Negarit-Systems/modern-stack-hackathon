"use client"

import type React from "react"

import { useState } from "react"
import { X, Mail, Lock, User, Github } from "lucide-react"
import { mockApiCall } from "@/lib/mockData"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: any) => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Validate form
      if (!formData.email || !formData.password) {
        throw new Error("Please fill in all required fields")
      }

      if (activeTab === "signup" && !formData.name) {
        throw new Error("Name is required for signup")
      }

      // Mock API call
      const endpoint = activeTab === "login" ? "auth/login" : "auth/signup"
      const response = await mockApiCall(endpoint, formData)

      if (response.success) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(response.user))
        onSuccess(response.user)
        onClose()

        // Reset form
        setFormData({ name: "", email: "", password: "" })
      } else {
        throw new Error("Authentication failed")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = (provider: string) => {
    console.log(`[v0] OAuth login with ${provider} - Mock implementation`)
    // Mock OAuth success
    const mockUser = {
      id: Date.now().toString(),
      name: `${provider} User`,
      email: `user@${provider.toLowerCase()}.com`,
    }
    localStorage.setItem("user", JSON.stringify(mockUser))
    onSuccess(mockUser)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">{activeTab === "login" ? "Sign In" : "Create Account"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex border border-border rounded-md mb-6">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md transition-colors ${
                activeTab === "login"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md transition-colors ${
                activeTab === "signup"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleOAuthLogin("Google")}
              className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-border rounded-md hover:bg-accent transition-colors"
            >
              <Mail size={18} />
              Continue with Google
            </button>
            <button
              onClick={() => handleOAuthLogin("GitHub")}
              className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-border rounded-md hover:bg-accent transition-colors"
            >
              <Github size={18} />
              Continue with GitHub
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">or</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "signup" && (
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  {activeTab === "login" ? "Signing In..." : "Creating Account..."}
                </div>
              ) : activeTab === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
