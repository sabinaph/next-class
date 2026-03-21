import Link from "next/link";

export default function ForInstructorsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-8">
      <h1 className="text-3xl font-bold">For Instructors</h1>
      <p className="text-muted-foreground">
        Teach on NextClass and reach engaged learners with a platform designed for outcomes and growth.
      </p>

      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <h2 className="text-xl font-semibold">Revenue Share (Per Course Sale)</h2>
        <p className="text-sm text-muted-foreground">
          We use a transparent model: instructors get 60% and NextClass keeps 40%.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-4">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Instructor Share</p>
            <p className="text-2xl font-bold">60%</p>
            <p className="text-xs text-muted-foreground mt-1">You keep the majority of every sale.</p>
          </div>
          <div className="rounded-xl border border-blue-300/40 bg-blue-500/10 p-4">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Platform Share</p>
            <p className="text-2xl font-bold">40%</p>
            <p className="text-xs text-muted-foreground mt-1">We invest in growth and operations.</p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>The 40% platform share covers:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Ads and student acquisition</li>
            <li>Website, hosting, and platform management</li>
            <li>Payment gateway and transaction processing costs</li>
            <li>Support, maintenance, and product improvements</li>
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-4 text-sm">
          <p className="font-medium">Example</p>
          <p className="text-muted-foreground mt-1">
            If a course sells for <span className="font-semibold text-foreground">NPR 5,000</span>,
            instructor earns <span className="font-semibold text-foreground">NPR 3,000</span>
            and platform keeps <span className="font-semibold text-foreground">NPR 2,000</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold mb-2">Create Courses</h2>
          <p className="text-sm text-muted-foreground">Build structured content with lessons, resources, and announcements.</p>
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold mb-2">Track Performance</h2>
          <p className="text-sm text-muted-foreground">Monitor student progress, reviews, and engagement insights.</p>
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold mb-2">Grow Revenue</h2>
          <p className="text-sm text-muted-foreground">Publish paid courses and manage earnings with transparent reporting.</p>
        </div>
      </div>

      <Link href="/auth/signup" className="underline font-medium">
        Become an instructor
      </Link>
    </div>
  );
}
