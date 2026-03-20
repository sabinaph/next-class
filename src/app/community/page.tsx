export default function CommunityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <h1 className="text-3xl font-bold">Community</h1>
      <p className="text-muted-foreground">
        Join fellow learners, share progress, ask questions, and collaborate on projects in the NextClass community.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold mb-2">Discussion Channels</h2>
          <p className="text-sm text-muted-foreground">Topic-based spaces for data, development, design, and career support.</p>
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold mb-2">Weekly Events</h2>
          <p className="text-sm text-muted-foreground">Live Q and A, mentor office hours, and learner demo sessions.</p>
        </div>
      </div>
    </div>
  );
}
