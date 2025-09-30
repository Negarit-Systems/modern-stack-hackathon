"use client"

import type React from "react"

import { useState } from "react"
import { Mail, MessageCircle, Phone, Send } from "lucide-react"

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Mock support ticket submission
      await new Promise((resolve) => setTimeout(resolve, 1000))

      alert("Support ticket submitted successfully! We'll get back to you soon.")
      setFormData({ name: "", email: "", subject: "", message: "" })
    } catch (error) {
      console.error("Support ticket submission failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Support Center</h1>
            <p className="text-muted-foreground">Need help? We're here to assist you with any questions or issues.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Methods */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
                  <Mail className="text-primary" size={24} />
                  <div>
                    <h3 className="font-medium">Email Support</h3>
                    <p className="text-sm text-muted-foreground">support@airesearchcopilot.com</p>
                    <p className="text-xs text-muted-foreground">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
                  <MessageCircle className="text-primary" size={24} />
                  <div>
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-sm text-muted-foreground">Available 9 AM - 5 PM EST</p>
                    <p className="text-xs text-muted-foreground">Monday through Friday</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
                  <Phone className="text-primary" size={24} />
                  <div>
                    <h3 className="font-medium">Phone Support</h3>
                    <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-xs text-muted-foreground">For urgent issues only</p>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Frequently Asked Questions</h3>
                <div className="space-y-3">
                  <details className="bg-card border border-border rounded-lg">
                    <summary className="p-4 cursor-pointer font-medium">
                      How do I invite collaborators to my research session?
                    </summary>
                    <div className="px-4 pb-4 text-sm text-muted-foreground">
                      Click the "Invite" button in your research dashboard and enter the email addresses of your
                      collaborators.
                    </div>
                  </details>

                  <details className="bg-card border border-border rounded-lg">
                    <summary className="p-4 cursor-pointer font-medium">Can I export my research reports?</summary>
                    <div className="px-4 pb-4 text-sm text-muted-foreground">
                      Yes! Use the "Export" button in your dashboard to download reports or send them via email.
                    </div>
                  </details>

                  <details className="bg-card border border-border rounded-lg">
                    <summary className="p-4 cursor-pointer font-medium">How does the AI summarization work?</summary>
                    <div className="px-4 pb-4 text-sm text-muted-foreground">
                      Our AI analyzes uploaded documents and web sources to generate key insights and summaries
                      automatically.
                    </div>
                  </details>
                </div>
              </div>
            </div>

            {/* Support Form */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Submit a Support Ticket</h2>

              <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Please describe your issue or question in detail..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Ticket
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
