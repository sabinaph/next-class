import Link from "next/link";

const posts = [
  {
    title: "How to Build a Consistent Learning Routine",
    summary: "A practical framework for learning 5-8 hours per week without burnout.",
    date: "Mar 2026",
  },
  {
    title: "Portfolio Projects That Get Interview Attention",
    summary: "What to build, what to avoid, and how to present your project outcomes.",
    date: "Feb 2026",
  },
  {
    title: "Learning Data Science as a Beginner",
    summary: "A roadmap from fundamentals to model deployment in simple steps.",
    date: "Jan 2026",
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="text-muted-foreground">Insights on learning, careers, and building practical skills.</p>
      </header>

      <div className="grid gap-4">
        {posts.map((post) => (
          <article key={post.title} className="rounded-xl border p-5">
            <p className="text-xs text-muted-foreground mb-1">{post.date}</p>
            <h2 className="text-lg font-semibold">{post.title}</h2>
            <p className="text-sm text-muted-foreground mt-2">{post.summary}</p>
          </article>
        ))}
      </div>

      <Link href="/courses" className="underline text-sm font-medium">
        Back to courses
      </Link>
    </div>
  );
}
