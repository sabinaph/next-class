"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Settings,
  BookOpen,
  Heart,
  Shield,
  GraduationCap,
  Bell,
  Megaphone,
  BookPlus,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { SimpleModeToggle } from "@/components/ModeToggle";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  className?: string;
}

type NotificationType = "ANNOUNCEMENT" | "NEW_LESSON" | "NEW_COURSE";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  href: string;
  createdAt: string;
}

interface ToastState {
  type: "success" | "error";
  title: string;
  message: string;
}

export default function Navbar({ className }: NavbarProps) {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [isSendingNotificationsEmail, setIsSendingNotificationsEmail] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      setNotifications([]);
      return;
    }

    let isMounted = true;

    const loadNotifications = async () => {
      setIsNotificationsLoading(true);
      try {
        const response = await fetch("/api/notifications", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const body = (await response.json()) as {
          notifications?: NotificationItem[];
        };

        if (isMounted) {
          setNotifications(body.notifications || []);
        }
      } catch {
        if (isMounted) {
          setNotifications([]);
        }
      } finally {
        if (isMounted) {
          setIsNotificationsLoading(false);
        }
      }
    };

    void loadNotifications();
    const intervalId = setInterval(() => {
      void loadNotifications();
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => clearTimeout(timer);
  }, [toast]);

  const getNotificationIcon = (type: NotificationType) => {
    if (type === "ANNOUNCEMENT") {
      return <Megaphone className="h-4 w-4 text-blue-600" />;
    }
    if (type === "NEW_LESSON") {
      return <Layers className="h-4 w-4 text-emerald-600" />;
    }
    return <BookPlus className="h-4 w-4 text-violet-600" />;
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString).getTime();
    const now = Date.now();
    const diffMs = now - date;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < hour) {
      const minutes = Math.max(1, Math.floor(diffMs / minute));
      return `${minutes}m ago`;
    }
    if (diffMs < day) {
      return `${Math.floor(diffMs / hour)}h ago`;
    }
    return `${Math.floor(diffMs / day)}d ago`;
  };

  const sendNotificationsToEmail = async () => {
    if (isSendingNotificationsEmail) return;

    setIsSendingNotificationsEmail(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to send notifications email");
      }

      const body = (await response.json()) as { count?: number };
      const count = body.count || 0;

      setToast({
        type: "success",
        title: "Email Sent",
        message:
          count > 0
            ? `${count} notifications were sent to your email.`
            : "No new notifications right now, but we sent a quick update email.",
      });
    } catch {
      setToast({
        type: "error",
        title: "Email Failed",
        message: "Could not send notifications email right now. Please try again.",
      });
    } finally {
      setIsSendingNotificationsEmail(false);
    }
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  const userInitials = session?.user?.name
    ? getInitials(session.user.name)
    : "U";

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md border-b border-border transition-colors duration-300",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/NEXTCLASS.png"
              alt="NextClass Logo"
              width={180}
              height={50}
              className="h-10 w-auto object-contain"
              priority
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              Next<span className="text-green-600">Class</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium"
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium"
            >
              Courses
            </Link>
            {session && (
              <Link
                href="/my-courses"
                className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium"
              >
                My Courses
              </Link>
            )}
            <Link
              href="/about"
              className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition font-medium"
            >
              About
            </Link>

            <SimpleModeToggle />

            {/* Auth Buttons / User Menu */}
            {session ? (
              <div className="ml-4 flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                      aria-label="Notifications"
                    >
                      <Bell className="h-5 w-5" />
                      {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                          {notifications.length > 9 ? "9+" : notifications.length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-96 max-h-[420px] overflow-y-auto" align="end">
                    <DropdownMenuLabel className="flex items-center justify-between gap-2">
                      <span>Notifications</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={sendNotificationsToEmail}
                        disabled={isSendingNotificationsEmail}
                      >
                        {isSendingNotificationsEmail ? "Sending..." : "Send to email"}
                      </Button>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isNotificationsLoading && notifications.length === 0 ? (
                      <div className="px-3 py-6 text-sm text-muted-foreground">Loading notifications...</div>
                    ) : notifications.length === 0 ? (
                      <div className="px-3 py-6 text-sm text-muted-foreground">No notifications yet.</div>
                    ) : (
                      notifications.map((notification) => (
                        <DropdownMenuItem key={notification.id} asChild>
                          <Link href={notification.href} className="cursor-pointer items-start py-3">
                            <span className="mr-2 mt-0.5">{getNotificationIcon(notification.type)}</span>
                            <span className="flex flex-1 flex-col">
                              <span className="text-sm font-medium leading-5">{notification.title}</span>
                              <span className="text-xs text-muted-foreground line-clamp-2">{notification.description}</span>
                              <span className="mt-1 text-[11px] text-muted-foreground">{formatRelativeTime(notification.createdAt)}</span>
                            </span>
                          </Link>
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full ring-2 ring-green-100 dark:ring-green-900 hover:ring-green-200 dark:hover:ring-green-800 transition-all p-0"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={session.user?.image || ""}
                          alt={session.user?.name || ""}
                        />
                        <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/my-courses"
                          className="cursor-pointer"
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          <span>My Courses</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/profile?tab=wishlist"
                          className="cursor-pointer"
                        >
                          <Heart className="mr-2 h-4 w-4" />
                          <span>Wishlist</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>

                    {/* Role Based Links */}
                    {session.user?.role === "INSTRUCTOR" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem asChild>
                            <Link href="/instructor" className="cursor-pointer">
                              <GraduationCap className="mr-2 h-4 w-4" />
                              <span>Instructor Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </>
                    )}

                    {session.user?.role === "ADMIN" && (
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-4 ml-4">
                <Link
                  href="/auth/signin"
                  className="text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 font-medium transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition font-medium shadow-lg shadow-gray-900/20 dark:shadow-none"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <SimpleModeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border animate-in slide-in-from-top-5">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Courses
            </Link>
            {session && (
              <Link
                href="/my-courses"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Courses
              </Link>
            )}
            <Link
              href="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2">
              {session ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-3 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 rounded-lg mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {session.user?.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {session.user?.email}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserIcon size={18} />
                    My Profile
                  </Link>
                  <Link
                    href="/my-courses"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BookOpen size={18} />
                    My Courses
                  </Link>

                  {session.user?.role === "INSTRUCTOR" && (
                    <Link
                      href="/instructor"
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <GraduationCap size={18} />
                      Instructor Dashboard
                    </Link>
                  )}

                  {session.user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Shield size={18} />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-4 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 transition"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/auth/signin"
                    className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block w-full text-center px-3 py-2 rounded-md text-base font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-4 top-20 z-80 w-[360px] max-w-[calc(100vw-2rem)] animate-in slide-in-from-top-3 fade-in-0 duration-300">
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md",
              toast.type === "success"
                ? "border-emerald-300/70 bg-emerald-50/95 dark:border-emerald-800 dark:bg-emerald-950/90"
                : "border-rose-300/70 bg-rose-50/95 dark:border-rose-800 dark:bg-rose-950/90"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 rounded-full p-1.5",
                  toast.type === "success"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/70 dark:text-rose-300"
                )}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold leading-none">{toast.title}</p>
                  {toast.type === "success" && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => setToast(null)}
                className="text-muted-foreground hover:text-foreground text-sm"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
