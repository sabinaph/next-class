export default function MentorshipPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <h1 className="text-3xl font-bold">Mentorship</h1>
      <p className="text-muted-foreground">
        Get one-on-one guidance from mentors to speed up your learning and improve project quality.
      </p>

      <div className="rounded-xl border p-6 space-y-2">
        <h2 className="font-semibold">What you get</h2>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Personalized learning plan</li>
          <li>Code and project feedback</li>
          <li>Interview and portfolio preparation</li>
        </ul>
      </div>
    </div>
  );
}
