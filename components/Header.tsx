"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  LogOut,
  Moon,
  Sun,
  Brain,
  Sparkles,
  Zap,
  Menu,
  X,
  Clock,
} from "lucide-react";
import AuthenticationModal from "./auth/AuthenticationModal";
import ConfirmationModal from "./modals/ConfirmationModal";
import { authClient } from "@/app/lib/auth.client";
import { useRouter } from "next/navigation";

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const authenticatedUser = authClient.useSession();
  const user = authenticatedUser?.data?.user || null;

  const confirmLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks

    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      setShowLogoutModal(false);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b transition-all duration-300 ${hasScrolled ? "border-white/10 shadow-lg" : "border-transparent"}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-24 h-24 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

        <div className="container mx-auto px-4 py-4 flex items-center justify-between relative">
          <Link
            href="/"
            className="flex items-center gap-3 group transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <div className="absolute bg-primary rounded-xl group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-primary p-3 rounded-xl shadow-lg">
                <Brain className="text-white" size={24} />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold bg-primary bg-clip-text text-transparent">
                AI Research
              </span>
              <Sparkles className="text-primary animate-pulse" size={16} />
            </div>
          </Link>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <nav
            className={`absolute md:relative top-full left-0 w-full md:w-auto bg-card md:bg-transparent border-b md:border-none border-border p-4 md:p-0 ${isMenuOpen ? "block" : "hidden"} md:flex items-center gap-6`}
          >
            {user ? (
              <>
                <Link
                  href="/sessions"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 hover:border-primary/30 transition-all duration-300 group backdrop-blur-sm cursor-pointer"
                >
                  <div className="p-1 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                    <Clock size={16} className="text-primary" />
                  </div>
                  <span className="font-medium">Recent Sessions</span>
                </Link>
                <div className="flex items-center gap-2 p-1 rounded-lg transition-colors">
                  <User size={16} className="text-primary" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-300 group backdrop-blur-sm cursor-pointer"
                >
                  <div className="p-1 rounded-lg bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                    <LogOut size={16} className="text-red-400" />
                  </div>
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => (setShowAuthModal(true), setIsSignUp(false))}
                  className="px-6 py-2 rounded-xl text-foreground hover:text-primary transition-all duration-300 font-medium hover:bg-white/5 backdrop-blur-sm cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => (setShowAuthModal(true), setIsSignUp(true))}
                  className="relative px-6 py-2 rounded-xl font-medium text-white overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-2">
                    <Zap size={16} />
                    Get Started
                  </span>
                </button>
              </div>
            )}

            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 group backdrop-blur-sm hover:scale-105 cursor-pointer"
            >
              <div className="relative">
                {darkMode ? (
                  <Sun
                    size={20}
                    className="text-yellow-400 group-hover:rotate-180 transition-transform duration-500"
                  />
                ) : (
                  <Moon
                    size={20}
                    className="text-blue-400 group-hover:rotate-12 transition-transform duration-300"
                  />
                )}
              </div>
            </button>
          </nav>
        </div>
      </header>

      <AuthenticationModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={() => {}}
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
      />
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        isLoading={isLoggingOut}
      />
    </>
  );
}
