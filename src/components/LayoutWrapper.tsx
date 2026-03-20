"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Check if current path starts with /auth (e.g. /auth/signin, /auth/signup)
  const isAuthPage = pathname?.startsWith("/auth");
  const isAdminPage = pathname?.startsWith("/admin");
  const isInstructorPage = pathname?.startsWith("/instructor");
  const isLearnPage = pathname?.startsWith("/learn");

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isAdminPage) {
    return <>{children}</>;
  }

  if (isInstructorPage) {
    return <>{children}</>;
  }

  if (isLearnPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="grow pt-16">{children}</main>
      <Footer />
    </div>
  );
}
