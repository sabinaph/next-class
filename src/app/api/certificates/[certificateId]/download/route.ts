import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { readFile } from "fs/promises";
import path from "path";

import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
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

  const drawCenteredText = (
    text: string,
    y: number,
    size: number,
    font: Awaited<ReturnType<typeof PDFDocument.create>>["embedFont"] extends (
      ...args: any[]
    ) => Promise<infer T>
      ? T
      : never,
    color = rgb(0.1, 0.15, 0.25),
    width = 1190
  ) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    return {
      text,
      x: (width - textWidth) / 2,
      y,
      size,
      font,
      color,
    };
  };

  const fitFontSize = (
    text: string,
    font: Awaited<ReturnType<typeof PDFDocument.create>>["embedFont"] extends (
      ...args: any[]
    ) => Promise<infer T>
      ? T
      : never,
    maxWidth: number,
    start: number,
    min: number
  ) => {
    let size = start;
    while (size > min && font.widthOfTextAtSize(text, size) > maxWidth) {
      size -= 1;
    }
    return size;
  };

  const wrapText = (
    text: string,
    font: Awaited<ReturnType<typeof PDFDocument.create>>["embedFont"] extends (
      ...args: any[]
    ) => Promise<infer T>
      ? T
      : never,
    size: number,
    maxWidth: number
  ) => {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([1190, 842]);
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const { width, height } = page.getSize();

  const outerBlue = rgb(0.72, 0.81, 0.98);
  const borderBlue = rgb(0.49, 0.64, 0.92);
  const deepBlue = rgb(0.17, 0.25, 0.44);
  const mutedBlue = rgb(0.37, 0.46, 0.64);

  // Paper background and decorative frame
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.95, 0.97, 1),
  });

  page.drawRectangle({
    x: 14,
    y: 14,
    width: width - 28,
    height: height - 28,
    borderColor: borderBlue,
    borderWidth: 2,
    color: outerBlue,
  });

  page.drawRectangle({
    x: 36,
    y: 36,
    width: width - 72,
    height: height - 72,
    borderColor: borderBlue,
    borderWidth: 1.5,
    color: rgb(0.99, 0.995, 1),
  });

  // Corner ornaments
  const drawCorner = (x: number, y: number, flipX = 1, flipY = 1) => {
    page.drawLine({
      start: { x, y },
      end: { x: x + 28 * flipX, y },
      thickness: 2,
      color: borderBlue,
    });
    page.drawLine({
      start: { x, y },
      end: { x, y: y + 28 * flipY },
      thickness: 2,
      color: borderBlue,
    });
    page.drawLine({
      start: { x: x + 8 * flipX, y },
      end: { x: x + 8 * flipX, y: y + 20 * flipY },
      thickness: 1,
      color: borderBlue,
    });
    page.drawLine({
      start: { x, y: y + 8 * flipY },
      end: { x: x + 20 * flipX, y: y + 8 * flipY },
      thickness: 1,
      color: borderBlue,
    });
  };

  drawCorner(30, height - 30, 1, -1);
  drawCorner(width - 30, height - 30, -1, -1);
  drawCorner(30, 30, 1, 1);
  drawCorner(width - 30, 30, -1, 1);

  // Header accent lines
  page.drawLine({
    start: { x: 80, y: height - 72 },
    end: { x: width - 80, y: height - 72 },
    thickness: 1,
    color: borderBlue,
  });

  // Brand logo
  try {
    const logoPath = path.join(process.cwd(), "public", "NEXTCLASS.png");
    const logoBytes = await readFile(logoPath);
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoW = 84;
    const logoH = (logoImage.height / logoImage.width) * logoW;
    page.drawImage(logoImage, {
      x: 88,
      y: height - 130,
      width: logoW,
      height: logoH,
      opacity: 0.95,
    });
  } catch {
    // If logo is missing, certificate still renders.
  }

  page.drawText("Next Class", {
    x: 185,
    y: height - 97,
    size: 30,
    font: titleFont,
    color: deepBlue,
  });

  page.drawText("CERTIFICATE OF ACHIEVEMENT", {
    ...drawCenteredText(
      "CERTIFICATE OF ACHIEVEMENT",
      height - 168,
      33,
      titleFont,
      deepBlue,
      width
    ),
  });

  page.drawText("This certificate is awarded to", {
    ...drawCenteredText(
      "This certificate is awarded to",
      height - 220,
      19,
      bodyFont,
      mutedBlue,
      width
    ),
  });

  const studentFontSize = fitFontSize(studentName, titleFont, width - 220, 56, 36);
  page.drawText(studentName, {
    ...drawCenteredText(studentName, height - 286, studentFontSize, titleFont, deepBlue, width),
  });

  page.drawLine({
    start: { x: 220, y: height - 302 },
    end: { x: width - 220, y: height - 302 },
    thickness: 1,
    color: rgb(0.72, 0.76, 0.84),
  });

  page.drawText("For successfully completing the course", {
    ...drawCenteredText(
      "For successfully completing the course",
      height - 356,
      20,
      bodyFont,
      mutedBlue,
      width
    ),
  });

  const courseTitleSize = fitFontSize(certificate.course.title, titleFont, width - 220, 44, 26);
  const courseLines = wrapText(certificate.course.title, titleFont, courseTitleSize, width - 220).slice(0, 2);
  let courseY = height - 414;
  for (const line of courseLines) {
    page.drawText(line, {
      ...drawCenteredText(line, courseY, courseTitleSize, titleFont, deepBlue, width),
    });
    courseY -= courseTitleSize + 6;
  }

  page.drawText("Issued by Next Class", {
    ...drawCenteredText("Issued by Next Class", courseY - 18, 16, italicFont, mutedBlue, width),
  });

  const issuedDate = new Date(certificate.issueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Footer blocks
  page.drawText(issuedDate, {
    x: 120,
    y: 146,
    size: 19,
    font: titleFont,
    color: deepBlue,
  });
  page.drawText("Date of Completion", {
    x: 120,
    y: 124,
    size: 13,
    font: bodyFont,
    color: mutedBlue,
  });

  page.drawLine({
    start: { x: width - 420, y: 156 },
    end: { x: width - 120, y: 156 },
    thickness: 1,
    color: rgb(0.68, 0.74, 0.85),
  });

  // Optional handwritten signature image for instructor.
  // Put file at: public/uploads/signatures/<instructorId>.(png|jpg|jpeg|webp)
  const signatureBasePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "signatures",
    certificate.course.instructor.id
  );
  const signatureCandidates = [
    `${signatureBasePath}.png`,
    `${signatureBasePath}.jpg`,
    `${signatureBasePath}.jpeg`,
    `${signatureBasePath}.webp`,
  ];

  for (const signaturePath of signatureCandidates) {
    try {
      const signatureBytes = await readFile(signaturePath);
      const signatureImage = signaturePath.endsWith(".png")
        ? await pdfDoc.embedPng(signatureBytes)
        : await pdfDoc.embedJpg(signatureBytes);

      const maxSignatureWidth = 220;
      const maxSignatureHeight = 52;
      const widthRatio = maxSignatureWidth / signatureImage.width;
      const heightRatio = maxSignatureHeight / signatureImage.height;
      const scale = Math.min(widthRatio, heightRatio, 1);

      const drawWidth = signatureImage.width * scale;
      const drawHeight = signatureImage.height * scale;

      page.drawImage(signatureImage, {
        x: width - 410,
        y: 162,
        width: drawWidth,
        height: drawHeight,
        opacity: 0.95,
      });

      break;
    } catch {
      // Try next candidate extension.
    }
  }

  page.drawText(instructorName, {
    x: width - 410,
    y: 132,
    size: 17,
    font: italicFont,
    color: deepBlue,
  });
  page.drawText("Instructor", {
    x: width - 410,
    y: 112,
    size: 13,
    font: bodyFont,
    color: mutedBlue,
  });

  page.drawText(
    `Certificate No: ${certificate.certificateNumber}   |   Verification: ${certificate.verificationCode}`,
    {
      x: 120,
      y: 78,
      size: 12,
      font: bodyFont,
      color: rgb(0.33, 0.4, 0.53),
    }
  );

  page.drawText(`Verify at: https://nextclass.app/certificates/${certificate.id}`, {
    x: 120,
    y: 58,
    size: 11,
    font: bodyFont,
    color: rgb(0.39, 0.45, 0.58),
  });

  const pdfBytes = await pdfDoc.save();
  const fileName = `${certificate.course.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-certificate.pdf`;
  const url = new URL(request.url);
  const isPreview = url.searchParams.get("preview") === "1";

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${isPreview ? "inline" : "attachment"}; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
