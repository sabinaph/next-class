const faqs = [
  {
    q: "How do I enroll in a course?",
    a: "Open a course page, continue to checkout, and complete payment using your preferred gateway.",
  },
  {
    q: "How can I access purchased courses?",
    a: "After payment completion, go to My Learning or open the course and click Start Learning.",
  },
  {
    q: "Where can I find invoices?",
    a: "Visit your profile payment history page to view and download invoices.",
  },
  {
    q: "How do I contact support?",
    a: "Use the Contact Us page and include your account email and order details for faster support.",
  },
];

export default function HelpCenterPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="text-muted-foreground">Common answers to help you get started quickly.</p>
      </header>

      <div className="space-y-4">
        {faqs.map((item) => (
          <section key={item.q} className="rounded-xl border p-5">
            <h2 className="font-semibold">{item.q}</h2>
            <p className="text-sm text-muted-foreground mt-2">{item.a}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
