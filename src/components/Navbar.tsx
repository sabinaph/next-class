"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { showToast } from "@/lib/toast";

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

export default function Navbar({ className }: NavbarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [isSendingNotificationsEmail, setIsSendingNotificationsEmail] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    ...(session ? [{ href: "/my-courses", label: "My Courses" }] : []),
    { href: "/about", label: "About" },
  ];

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
    const onScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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

      const body = (await response.json().catch(() => null)) as
        | { count?: number; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(body?.error || "Failed to send notifications email");
      }

      const count = body.count || 0;

      showToast({
        type: "success",
        title: "Email Sent",
        message:
          count > 0
            ? `${count} notifications were sent to your email.`
            : "No new notifications right now, but we sent a quick update email.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not send notifications email right now. Please try again.";

      showToast({
        type: "error",
        title: "Email Failed",
        message,
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

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-3 sm:px-6",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto mt-2 w-full max-w-7xl rounded-2xl border border-border/75 bg-background/75 backdrop-blur-xl transition-all duration-300",
          isScrolled ? "shadow-xl shadow-black/10 dark:shadow-black/30" : "shadow-md shadow-black/5 dark:shadow-black/20"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <Image
              src="/NEXTCLASS.png"
              alt="NextClass Logo"
              width={180}
              height={50}
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              priority
            />
            <span className="hidden text-xl font-bold text-gray-900 sm:block dark:text-white">
              Next<span className="text-green-600">Class</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center rounded-full border border-border/80 bg-muted/45 p-1">
              {navLinks.map((link) => {
                const isActive = isActiveRoute(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm font-semibold transition",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <SimpleModeToggle />

            {/* Auth Buttons / User Menu */}
            {session ? (
              <div className="ml-2 flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full border border-border/70 bg-background/70"
                      aria-label="Notifications"
                    >
                      <Bell className="h-5 w-5" />
                      {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                          {notifications.length > 9 ? "9+" : notifications.length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-h-[420px] w-96 overflow-y-auto" align="end">
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
                              <span className="line-clamp-2 text-xs text-muted-foreground">{notification.description}</span>
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
                      className="relative h-10 w-10 rounded-full p-0 ring-2 ring-green-100 transition-all hover:ring-green-200 dark:ring-green-900 dark:hover:ring-green-800"
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
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-foreground/90 transition hover:text-primary"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:brightness-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <SimpleModeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-full border border-border/70 bg-background/70 p-2 text-foreground/85 transition hover:text-primary"
              aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mx-auto mt-2 w-full max-w-7xl rounded-2xl border border-border/75 bg-background/95 p-3 shadow-xl shadow-black/10 backdrop-blur-xl md:hidden">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = isActiveRoute(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block rounded-xl px-3 py-2 text-base font-medium transition",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/85 hover:bg-muted"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="my-2 border-t border-border/70 pt-2">
              {session ? (
                <>
                  <div className="mb-2 flex items-center gap-3 rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-foreground">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image || ""} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {session.user?.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {session.user?.email}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-base font-medium text-foreground/85 transition hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserIcon size={18} />
                    My Profile
                  </Link>
                  <Link
                    href="/my-courses"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-base font-medium text-foreground/85 transition hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BookOpen size={18} />
                    My Courses
                  </Link>

                  {session.user?.role === "INSTRUCTOR" && (
                    <Link
                      href="/instructor"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-base font-medium text-foreground/85 transition hover:bg-muted"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <GraduationCap size={18} />
                      Instructor Dashboard
                    </Link>
                  )}

                  {session.user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-base font-medium text-foreground/85 transition hover:bg-muted"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Shield size={18} />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-base font-medium text-white transition hover:bg-red-700"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/auth/signin"
                    className="block w-full rounded-xl px-3 py-2 text-center text-base font-semibold text-foreground/90 transition hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block w-full rounded-xl bg-primary px-3 py-2 text-center text-base font-semibold text-primary-foreground transition hover:brightness-95"
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

    </nav>
  );
}
