export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Last updated: March 20, 2026</p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Acceptance of terms</h2>
        <p className="text-sm text-muted-foreground">
          By using NextClass, you agree to these terms, applicable policies, and lawful use of the platform.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Account responsibilities</h2>
        <p className="text-sm text-muted-foreground">
          You are responsible for maintaining account security and all activity under your account.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Payments and refunds</h2>
        <p className="text-sm text-muted-foreground">
          Paid purchases provide course access as specified at checkout. Refund decisions are subject to our
          support and policy review.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Prohibited use</h2>
        <p className="text-sm text-muted-foreground">
          Unauthorized sharing, copying, scraping, or misuse of learning content and platform resources is prohibited.
        </p>
      </section>
    </div>
  );
}
