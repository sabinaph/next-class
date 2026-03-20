import Link from "next/link";

const plans = [
  { name: "Starter", price: "Free", features: ["Free resources", "Community access", "Basic support"] },
  { name: "Pro", price: "NPR 2,999", features: ["Full paid courses", "Certificates", "Priority support"] },
  { name: "Mentor Plus", price: "NPR 5,999", features: ["All Pro features", "Mentorship sessions", "Career guidance"] },
];

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 space-y-10">
      <header className="text-center space-y-3">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="text-muted-foreground">Flexible options for learners at every stage.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div key={plan.name} className="rounded-xl border p-6">
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="text-2xl font-bold mt-2">{plan.price}</p>
            <ul className="mt-4 text-sm text-muted-foreground list-disc pl-5 space-y-1">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link href="/courses" className="underline font-medium">
          Explore available courses
        </Link>
      </div>
    </div>
  );
}
