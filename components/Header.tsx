"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { User, LogOut, Moon, Sun } from "lucide-react"
import AuthenticationModal from "./auth/AuthenticationModal";
import ConfirmationModal from "./modals/ConfirmationModal";

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    // Check for logged in user
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData)
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("userAuthenticated"))
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    // In a real app, this would update the theme
    console.log("[v0] Dark mode toggled:", !darkMode)
  }

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            AI Research Copilot
          </Link>

          <nav className="flex items-center gap-6">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <User size={20} />
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}

            <button onClick={toggleDarkMode} className="p-2 rounded-md hover:bg-accent transition-colors">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>
        </div>
      </header>

      <AuthenticationModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onAuthenticated={handleAuthSuccess} 
      />
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
      />
    </>
  )
}
