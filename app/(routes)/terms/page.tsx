export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using AI Research Copilot, you accept and agree to be bound by the terms and provision
                of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Use License</h2>
              <p className="text-muted-foreground">
                Permission is granted to temporarily use AI Research Copilot for personal, non-commercial transitory
                viewing only.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Privacy Policy</h2>
              <p className="text-muted-foreground">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the
                Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at
                support@airesearchcopilot.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
