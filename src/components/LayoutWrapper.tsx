"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminNavbar from "@/components/AdminNavbar";
import InstructorNavbar from "@/components/InstructorNavbar";

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

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <AdminNavbar />
        <main className="grow pt-16">{children}</main>
      </div>
    );
  }

  if (isInstructorPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <InstructorNavbar />
        <main className="grow pt-16">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="grow pt-16">{children}</main>
      <Footer />
    </div>
  );
}
