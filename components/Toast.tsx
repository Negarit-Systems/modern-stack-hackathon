"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

interface ToastProps {
  message: string
  type: "success" | "error" | "info" | "warning"
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, isVisible, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-500" size={20} />
      case "error":
        return <AlertCircle className="text-red-500" size={20} />
      case "warning":
        return <AlertTriangle className="text-yellow-500" size={20} />
      case "info":
      default:
        return <Info className="text-blue-500" size={20} />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
      case "error":
        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
      case "info":
      default:
        return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-md ${getBgColor()}`}>
        {getIcon()}
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-md transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

// Hook for using toasts
export function useToast() {
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error" | "info" | "warning"
    isVisible: boolean
  }>({
    message: "",
    type: "info",
    isVisible: false,
  })

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    setToast({ message, type, isVisible: true })
  }

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }))
  }

  return {
    toast,
    showToast,
    hideToast,
    ToastComponent: () => (
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={hideToast} />
    ),
  }
}
