"use client"
import { X, AlertTriangle, Sparkles, Loader2 } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  isLoading?: boolean
}

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, isLoading = false }: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse animation-delay-1000" />
      </div>

      <div className="relative bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 fade-in-0 duration-300">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 p-[1px]">
          <div className="h-full w-full rounded-2xl bg-background/95 backdrop-blur-xl" />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between p-6 border-b border-border/30">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <div className="relative">
                <AlertTriangle className="text-destructive w-6 h-6" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-accent animate-pulse" />
              </div>
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {title}
              </span>
            </h2>
            <button
              onClick={onClose}
              className="group p-2 hover:bg-accent/10 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <X size={20} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-muted-foreground mb-8 leading-relaxed text-pretty">{message}</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="group cursor-pointer relative px-6 py-2.5 bg-secondary/50 hover:bg-secondary/70 disabled:opacity-50 disabled:cursor-not-allowed text-secondary-foreground rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg border border-border/30"
              >
                <span className="relative z-10">Cancel</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-secondary/20 to-secondary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>

              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="group cursor-pointer relative px-6 py-2.5 bg-gradient-to-r from-destructive to-destructive/90 hover:from-destructive/90 hover:to-destructive disabled:opacity-50 disabled:cursor-not-allowed text-destructive-foreground rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-destructive/25 border border-destructive/30"
              >
                <span className="relative z-10 font-medium flex items-center gap-2">
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {isLoading ? "Logging out..." : "Confirm"}
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
  