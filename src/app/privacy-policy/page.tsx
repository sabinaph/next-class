export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: March 20, 2026</p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Information we collect</h2>
        <p className="text-sm text-muted-foreground">
          We collect account details, course activity, and payment metadata necessary to provide services,
          improve the platform, and secure transactions.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">How we use information</h2>
        <p className="text-sm text-muted-foreground">
          We use data to create your account, deliver courses, process payments, send transactional emails,
          and improve learning experience.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Data sharing</h2>
        <p className="text-sm text-muted-foreground">
          We do not sell personal information. We may share limited data with secure service providers for
          payments, email delivery, and platform operations.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Your rights</h2>
        <p className="text-sm text-muted-foreground">
          You may request access, correction, or deletion of your personal data by contacting support.
        </p>
      </section>
    </div>
  );
}
