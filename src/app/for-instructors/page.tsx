import Link from "next/link";

export default function ForInstructorsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 space-y-8">
      <h1 className="text-3xl font-bold">Become an Instructor</h1>
      <p className="text-muted-foreground">
        Share your knowledge and earn money by teaching students worldwide.
      </p>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <p className="text-sm text-muted-foreground">
          Fill out the application below and our team will review your request.
        </p>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Requirements</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>Good knowledge of your subject</li>
            <li>Ability to create structured courses</li>
            <li>Basic communication skills</li>
          </ul>
        </div>

        <div className="pt-1">
          <Link
            href="/auth/signup"
            className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Apply Now
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">After Approval</h2>
        <p className="text-sm text-muted-foreground">
          Once approved, you will get access to the Instructor Dashboard and the tools you need to grow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border p-4">
            <h3 className="font-medium">Upload Course</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create lessons, add resources, and publish your course content.
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <h3 className="font-medium">Set Price</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose your course pricing strategy in NPR.
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <h3 className="font-medium">Track Earnings</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor enrollments and your 60% instructor revenue share.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-muted/40 p-6">
        <h2 className="text-lg font-semibold">Pro Tip</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We will soon add an Instructor Guidelines page and a How to Create Course tutorial to help you publish faster.
        </p>
      </div>
    </div>
  );
}
