import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/support" className="hover:text-foreground transition-colors">
            Support
          </Link>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-4">
          © 2025 AI Research Copilot. Built for collaborative research.
        </div>
      </div>
    </footer>
  )
}
