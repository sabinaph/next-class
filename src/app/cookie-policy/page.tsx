export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <h1 className="text-3xl font-bold">Cookie Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: March 20, 2026</p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">What are cookies</h2>
        <p className="text-sm text-muted-foreground">
          Cookies are small text files used to remember preferences, support login sessions, and improve site performance.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">How we use cookies</h2>
        <p className="text-sm text-muted-foreground">
          We use essential cookies for authentication and security, plus optional analytics cookies for product improvements.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Managing cookies</h2>
        <p className="text-sm text-muted-foreground">
          You can manage cookies through your browser settings. Disabling essential cookies may affect site functionality.
        </p>
      </section>
    </div>
  );
}
