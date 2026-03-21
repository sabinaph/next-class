import { prisma } from "@/app/lib/prisma";
import { approveInstructorApplication, rejectInstructorApplication } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default async function InstructorApplicationsPage() {
  const applications = await prisma.instructorApplication.findMany({
    include: {
      reviewedBy: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = applications.filter((a) => a.status === "PENDING");
  const reviewed = applications.filter((a) => a.status !== "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Instructor Applications</h1>
        <p className="mt-1 text-muted-foreground">
          Review applications, approve or reject, and send email updates automatically.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pending Applications ({pending.length})</h2>

        {pending.length === 0 ? (
          <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
            No pending applications.
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((application) => (
              <div key={application.id} className="rounded-xl border bg-card p-5 space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{application.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{application.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{application.phoneNumber || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Applied On</p>
                    <p className="font-medium">{new Date(application.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Study Background</p>
                    <p>{application.studyBackground}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hobbies</p>
                    <p>{application.hobbies}</p>
                  </div>
                  {application.expertise ? (
                    <div>
                      <p className="text-sm text-muted-foreground">Expertise</p>
                      <p>{application.expertise}</p>
                    </div>
                  ) : null}
                  {application.bio ? (
                    <div>
                      <p className="text-sm text-muted-foreground">Bio</p>
                      <p>{application.bio}</p>
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <form action={approveInstructorApplication} className="space-y-3 rounded-lg border p-4">
                    <h3 className="font-semibold">Approve and Create Instructor Login</h3>
                    <input type="hidden" name="applicationId" value={application.id} />
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <Input name="firstName" required placeholder="First name" />
                      <Input name="lastName" required placeholder="Last name" />
                    </div>
                    <Input name="username" required placeholder="Username" />
                    <Input name="password" type="text" minLength={8} required placeholder="Temporary password" />
                    <Textarea name="adminNotes" placeholder="Optional note" rows={2} />
                    <Button type="submit" className="w-full">Approve Application</Button>
                  </form>

                  <form action={rejectInstructorApplication} className="space-y-3 rounded-lg border p-4">
                    <h3 className="font-semibold">Reject Application</h3>
                    <input type="hidden" name="applicationId" value={application.id} />
                    <Textarea
                      name="adminNotes"
                      required
                      rows={5}
                      placeholder="Write rejection reason (will be emailed)."
                    />
                    <Button type="submit" variant="destructive" className="w-full">
                      Reject Application
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Reviewed Applications ({reviewed.length})</h2>

        {reviewed.length === 0 ? (
          <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
            No reviewed applications yet.
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left">Applicant</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Reviewed By</th>
                  <th className="px-4 py-3 text-left">Reviewed At</th>
                  <th className="px-4 py-3 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {reviewed.map((application) => (
                  <tr key={application.id} className="border-t">
                    <td className="px-4 py-3">
                      <p className="font-medium">{application.fullName}</p>
                      <p className="text-muted-foreground">{application.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          application.status === "APPROVED"
                            ? "rounded-full bg-green-500/15 px-2 py-1 text-xs font-semibold text-green-700 dark:text-green-300"
                            : "rounded-full bg-red-500/15 px-2 py-1 text-xs font-semibold text-red-700 dark:text-red-300"
                        }
                      >
                        {application.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {application.reviewedBy?.name || application.reviewedBy?.email || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {application.reviewedAt
                        ? new Date(application.reviewedAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{application.adminNotes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
