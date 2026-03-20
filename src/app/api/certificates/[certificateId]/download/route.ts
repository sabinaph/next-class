import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { certificateId } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          name: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!certificate) {
    return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
  }

  const canAccess =
    certificate.student.id === session.user.id ||
    certificate.course.instructor.id === session.user.id ||
    session.user.role === "ADMIN";

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const studentName =
    `${certificate.student.firstName || ""} ${certificate.student.lastName || ""}`.trim() ||
    certificate.student.name ||
    "Student";

  const instructorName =
    `${certificate.course.instructor.firstName || ""} ${certificate.course.instructor.lastName || ""}`.trim() ||
    certificate.course.instructor.name ||
    "Instructor";

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([1190, 842]);
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();

  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0.08, 0.42, 0.29),
    borderWidth: 4,
    color: rgb(0.97, 0.99, 0.98),
  });

  page.drawRectangle({
    x: 40,
    y: 40,
    width: width - 80,
    height: height - 80,
    borderColor: rgb(0.13, 0.52, 0.36),
    borderWidth: 1,
  });

  page.drawText("CERTIFICATE OF COMPLETION", {
    x: 295,
    y: height - 130,
    size: 42,
    font: titleFont,
    color: rgb(0.08, 0.32, 0.25),
  });

  page.drawText("This certifies that", {
    x: 495,
    y: height - 220,
    size: 24,
    font: bodyFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(studentName, {
    x: 170,
    y: height - 300,
    size: 52,
    font: titleFont,
    color: rgb(0.06, 0.29, 0.2),
  });

  page.drawText("has successfully completed", {
    x: 410,
    y: height - 360,
    size: 24,
    font: bodyFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(certificate.course.title, {
    x: 120,
    y: height - 430,
    size: 36,
    font: titleFont,
    color: rgb(0.08, 0.32, 0.25),
  });

  page.drawText(`Instructor: ${instructorName}`, {
    x: 120,
    y: 170,
    size: 22,
    font: bodyFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText(`Certificate No: ${certificate.certificateNumber}`, {
    x: 120,
    y: 120,
    size: 16,
    font: bodyFont,
    color: rgb(0.25, 0.25, 0.25),
  });

  page.drawText(`Verification Code: ${certificate.verificationCode}`, {
    x: 120,
    y: 95,
    size: 16,
    font: bodyFont,
    color: rgb(0.25, 0.25, 0.25),
  });

  page.drawText(
    `Issued On: ${new Date(certificate.issueDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    {
      x: 120,
      y: 70,
      size: 16,
      font: bodyFont,
      color: rgb(0.25, 0.25, 0.25),
    }
  );

  page.drawLine({
    start: { x: width - 390, y: 170 },
    end: { x: width - 120, y: 170 },
    thickness: 1,
    color: rgb(0.25, 0.25, 0.25),
  });

  page.drawText(instructorName, {
    x: width - 365,
    y: 145,
    size: 16,
    font: bodyFont,
    color: rgb(0.2, 0.2, 0.2),
  });

  page.drawText("Instructor Signature", {
    x: width - 350,
    y: 120,
    size: 13,
    font: bodyFont,
    color: rgb(0.35, 0.35, 0.35),
  });

  const pdfBytes = await pdfDoc.save();
  const fileName = `${certificate.course.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-certificate.pdf`;

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
