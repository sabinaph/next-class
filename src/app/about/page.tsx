import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-10">
      <section className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">About NextClass</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          NextClass is a learning platform built to help students and professionals gain practical skills with
          structured courses, mentorship, and measurable outcomes.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold mb-2">Our Mission</h2>
          <p className="text-sm text-muted-foreground">
            Make high-quality education accessible, practical, and outcome-focused.
          </p>
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold mb-2">Our Vision</h2>
          <p className="text-sm text-muted-foreground">
            Build a trusted ecosystem where learners grow into confident professionals.
          </p>
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold mb-2">Our Promise</h2>
          <p className="text-sm text-muted-foreground">
            Clear learning paths, expert guidance, and real project-based learning.
          </p>
        </div>
      </section>

      <section className="rounded-xl border p-6">
        <h2 className="text-xl font-semibold mb-3">What makes us different</h2>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
          <li>Practical courses designed for real-world skills</li>
          <li>Mentorship and progress tracking built into the journey</li>
          <li>Certificates and portfolio outcomes to showcase your growth</li>
        </ul>
      </section>

      <section className="text-center">
        <Link href="/courses" className="underline font-medium">
          Explore courses
        </Link>
      </section>
    </div>
  );
}
