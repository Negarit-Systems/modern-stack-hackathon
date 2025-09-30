"use client";

import React, { useState } from "react";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/app/lib/auth.client";
import animatedGoogle from "@/public/animations/google.json";
import dynamic from "next/dynamic";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  {
    ssr: false,
    loading: () => (
      <div className="w-[100px] h-[100px] bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
    ),
  }
);

interface AuthenticationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: any) => void;
  isSignUp: boolean;
  setIsSignUp: (isSignUp: boolean) => void;
}

export default function AuthenticationModal({
  isOpen,
  onClose,
  onAuthenticated,
  isSignUp = false,
  setIsSignUp,
}: AuthenticationModalProps) {
  // const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuthSubmit = async () => {
    const user = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
      errorCallbackURL: "/error",
      newUserCallbackURL: "/dashboard",
      disableRedirect: false,
    });

    if (user.error) {
      setError(user.error.message ?? "Signup failed");
      return;
    }
    onAuthenticated(user);

    onClose();
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return;
        }
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters");
          return;
        }
        const res = await authClient.signUp.email({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        if (res.error) {
          setError(res.error.message ?? "Signup failed");
          return;
        }

        onAuthenticated(res.data?.user);
      } else {
        const res = await authClient.signIn.email({
          email: formData.email,
          password: formData.password,
        });

        if (res.error) {
          setError(res.error.message ?? "Login failed");
          return;
        }
        onAuthenticated(res.data?.user);
      }
      onClose();
      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-md dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 dark:border-slate-700/50 dark:rounded-2xl dark:shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border dark:border-slate-700/50">
          <h2 className="text-xl font-semibold dark:text-white">
            {isSignUp ? "Create Account" : "Sign In"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-md transition-colors dark:hover:bg-slate-700/50 dark:text-slate-300 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-200">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-slate-500"
                  size={18}
                />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800/50 dark:border-slate-600/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-500/30 dark:focus:border-blue-500/50"
                  placeholder="Enter your full name"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-slate-200">Email</label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-slate-500"
                size={18}
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800/50 dark:border-slate-600/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-500/30 dark:focus:border-blue-500/50"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-slate-200">Password</label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-slate-500"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-10 pr-12 py-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800/50 dark:border-slate-600/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-500/30 dark:focus:border-blue-500/50"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-slate-500 dark:hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-slate-200">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-slate-500"
                  size={18}
                />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800/50 dark:border-slate-600/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-blue-500/30 dark:focus:border-blue-500/50"
                  placeholder="Confirm your password"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={handleAuthSubmit}
              className="w-full flex items-center cursor-pointer justify-center gap-2 border border-border py-3 px-6 rounded-md hover:bg-accent transition-colors mb-2 dark:border-slate-700/50 dark:bg-slate-800/40 dark:hover:bg-slate-700/40 dark:rounded-xl dark:backdrop-blur-sm dark:text-slate-200"
            >
              <span>
                <Player
                  autoplay
                  loop
                  src={animatedGoogle}
                  style={{ height: "40px", width: "40px" }}
                />
              </span>
              Sign in with Google
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-600 dark:hover:from-blue-700 dark:hover:to-indigo-700 dark:shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                {isSignUp ? "Creating Account..." : "Signing In..."}
              </div>
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
