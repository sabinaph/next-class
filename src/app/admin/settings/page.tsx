import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Platform Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow Instructor Self-Publish</p>
              <p className="text-sm text-muted-foreground">
                Permit instructors to publish courses without admin review.
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              Enabled
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">System Email Alerts</p>
              <p className="text-sm text-muted-foreground">
                Send admin alerts for critical system and moderation events.
              </p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              Enabled
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
