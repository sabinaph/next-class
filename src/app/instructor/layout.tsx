import { InstructorSidebar } from "@/components/instructor/InstructorSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Require authenticated instructors
  if (!session || session.user.role !== "INSTRUCTOR") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <InstructorSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
