"use server";

import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createCategory(name: string) {
  await requireAdmin();

  const normalized = name.trim();
  if (!normalized) throw new Error("Category name is required");

  await prisma.category.create({
    data: {
      name: normalized,
      slug: toSlug(normalized),
      isActive: true,
    },
  });

  revalidatePath("/admin/categories");
}

export async function toggleCategory(categoryId: string, isActive: boolean) {
  await requireAdmin();

  await prisma.category.update({
    where: { id: categoryId },
    data: { isActive },
  });

  revalidatePath("/admin/categories");
}
