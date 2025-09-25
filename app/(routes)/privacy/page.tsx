export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
              <p className="text-muted-foreground">
                We collect information you provide directly to us, such as when you create an account, use our services,
                or contact us for support.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground">
                We use the information we collect to provide, maintain, and improve our services, process transactions,
                and communicate with you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Information Sharing</h2>
              <p className="text-muted-foreground">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your
                consent, except as described in this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at privacy@airesearchcopilot.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
