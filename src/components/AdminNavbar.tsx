"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimpleModeToggle } from "@/components/ModeToggle";

export default function AdminNavbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Admin Panel</span>
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400">Dashboard</Link>
            <Link href="/admin/instructors" className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400">Instructors</Link>
            <Link href="/admin/students" className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400">Students</Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SimpleModeToggle />
          <span className="hidden sm:inline text-sm text-muted-foreground">{session?.user?.name || "Admin"}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
