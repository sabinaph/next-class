import Link from "next/link";

export default function ForInstructorsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-8">
      <h1 className="text-3xl font-bold">For Instructors</h1>
      <p className="text-muted-foreground">
        Teach on NextClass and reach engaged learners with a platform designed for outcomes and growth.
      </p>

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
