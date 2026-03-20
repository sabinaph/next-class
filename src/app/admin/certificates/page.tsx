import { prisma } from "@/app/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateMissingCertificates, toggleCertificateValidity } from "@/actions/admin";

export default async function AdminCertificatesPage() {
  const certificates = await prisma.certificate.findMany({
    include: {
      student: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      course: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground">Issue and validate learner certificates.</p>
        </div>
        <form action={generateMissingCertificates}>
          <Button type="submit">Generate Missing Certificates</Button>
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-3">Certificate</th>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Course</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Issued</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((certificate) => (
                  <tr key={certificate.id} className="border-b bg-white dark:bg-gray-900 dark:border-gray-700">
                    <td className="px-6 py-4">
                      <div className="font-medium">{certificate.certificateNumber}</div>
                      <div className="text-xs text-muted-foreground">{certificate.verificationCode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {(certificate.student.firstName || "") + " " + (certificate.student.lastName || "")}
                      </div>
                      <div className="text-xs text-muted-foreground">{certificate.student.email}</div>
                    </td>
                    <td className="px-6 py-4">{certificate.course.title}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          certificate.isValid
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {certificate.isValid ? "Valid" : "Revoked"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(certificate.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <form
                        action={toggleCertificateValidity.bind(
                          null,
                          certificate.id,
                          !certificate.isValid
                        )}
                      >
                        <Button type="submit" variant="outline" size="sm">
                          {certificate.isValid ? "Revoke" : "Activate"}
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
                {certificates.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No certificates yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
