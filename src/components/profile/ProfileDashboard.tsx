"use client";

import { useState } from "react";
import {
  User,
  Lock,
  Mail,
  UserCircle,
  Save,
  Loader2,
  Key,
  GraduationCap,
  Heart,
  Calendar,
  BookOpen,
  Clock,
  Award,
  Download,
  Eye,
  ExternalLink,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define the shape of user data passed from the server
interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  bookings: any[]; // We'll type this properly or use 'any' for now to avoid complexity in this file
  wishlist: any[];
  certificates: any[];
}

export default function ProfileDashboard({
  initialData,
}: {
  initialData: UserData;
}) {
  const { update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "learning" | "schedule" | "wishlist" | "personal" | "security"
  >("learning");

  // Personal Form State
  const [personalData, setPersonalData] = useState({
    firstName: initialData.firstName || "",
    lastName: initialData.lastName || "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });
  const [previewCertificateUrl, setPreviewCertificateUrl] = useState<string | null>(null);
  const [previewCertificateTitle, setPreviewCertificateTitle] = useState("");
  const [previewDownloadUrl, setPreviewDownloadUrl] = useState<string | null>(null);

  const getPreviewUrl = (certificateUrl: string) =>
    `${certificateUrl}${certificateUrl.includes("?") ? "&" : "?"}preview=1`;

  // Handlers
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(personalData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setProfileMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
      // Update session locally so Navbar updates immediately
      await update({
        name: `${personalData.firstName} ${personalData.lastName}`.trim(),
      });
      router.refresh();
    } catch (error: any) {
      setProfileMessage({ type: "error", text: error.message });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update password");

      setPasswordMessage({
        type: "success",
        text: "Password updated successfully!",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      setPasswordMessage({ type: "error", text: error.message });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const NavButton = ({
    tab,
    icon: Icon,
    label,
  }: {
    tab: typeof activeTab;
    icon: any;
    label: string;
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium w-full ${
        activeTab === tab
          ? "bg-card text-primary shadow-sm border border-border"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="flex min-h-[600px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl md:flex-row">
      {/* Sidebar / Tabs */}
      <div className="flex w-full flex-col gap-2 border-r border-border bg-muted/60 p-6 md:w-64">
        <h2 className="mb-6 px-2 text-xl font-bold text-foreground">
          Dashboard
        </h2>

        <NavButton tab="learning" icon={GraduationCap} label="My Learning" />
        <NavButton tab="schedule" icon={Calendar} label="Schedule" />
        <NavButton tab="wishlist" icon={Heart} label="Wishlist" />

        <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
          Account
        </h2>

        <NavButton tab="personal" icon={UserCircle} label="Personal Info" />
        <NavButton tab="security" icon={Lock} label="Security" />
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-card p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          {activeTab === "learning" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-2xl font-bold text-foreground">
                My Learning
              </h3>
              <div className="grid gap-6">
                {initialData.bookings?.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <BookOpen className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      You haven't enrolled in any courses yet.
                    </p>
                    <Link href="/courses">
                      <Button variant="link" className="mt-2 text-green-600">
                        Browse Courses
                      </Button>
                    </Link>
                  </div>
                ) : (
                  initialData.bookings?.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="flex flex-col sm:flex-row gap-4 p-4 border rounded-xl hover:shadow-md transition-shadow bg-card"
                    >
                      <div className="w-full sm:w-48 aspect-video bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={booking.course.thumbnail || "/default-coures.jpg"}
                          alt={booking.course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-lg line-clamp-1">
                            {booking.course.title}
                          </h4>
                          <p className="mb-2 text-sm text-muted-foreground">
                            Instructor:{" "}
                            {booking.course.instructor?.name ||
                              booking.course.instructor?.firstName ||
                              "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-4 sm:mt-0">
                          <Badge
                            variant={
                              booking.status === "CONFIRMED"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              booking.status === "CONFIRMED"
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : ""
                            }
                          >
                            {booking.status}
                          </Badge>
                          <Link href={`/learn/${booking.course.id}`}>
                            <Button size="sm" variant="outline">
                              Continue Learning
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div className="mt-4 rounded-xl border p-4 bg-gray-50 dark:bg-gray-800/40">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-semibold text-base">My Certificates</h4>
                  </div>

                  {initialData.certificates?.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Complete all lessons in a course to unlock certificates.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {initialData.certificates.map((certificate: any) => (
                        <div
                          key={certificate.id}
                          className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-medium">{certificate.course.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Instructor: {certificate.course.instructor?.name || certificate.course.instructor?.firstName || "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Issued: {new Date(certificate.issueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="gap-2"
                              onClick={() => {
                                setPreviewCertificateTitle(certificate.course.title);
                                setPreviewCertificateUrl(getPreviewUrl(certificate.certificateUrl));
                                setPreviewDownloadUrl(certificate.certificateUrl);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              Preview
                            </Button>
                            <a href={certificate.certificateUrl}>
                              <Button size="sm" variant="outline" className="gap-2">
                                <Download className="w-4 h-4" />
                                Download Certificate
                              </Button>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-2xl font-bold text-foreground">
                Upcoming Schedule
              </h3>
              <div className="space-y-4">
                {initialData.bookings?.filter(
                  (b) => new Date(b.session.sessionDate) > new Date()
                ).length === 0 ? (
                  <p className="text-muted-foreground">
                    No upcoming sessions scheduled.
                  </p>
                ) : (
                  initialData.bookings
                    ?.filter(
                      (b) => new Date(b.session.sessionDate) > new Date()
                    )
                    .map((booking) => (
                      <div
                        key={booking.id}
                          className="flex items-center gap-4 rounded-xl border border-border bg-muted/60 p-4"
                      >
                          <div className="min-w-[60px] rounded-lg bg-card p-3 text-center">
                            <div className="text-xs font-bold uppercase text-muted-foreground">
                            {new Date(
                              booking.session.sessionDate
                            ).toLocaleDateString("en-US", { month: "short" })}
                          </div>
                            <div className="text-xl font-bold text-green-600">
                            {new Date(
                              booking.session.sessionDate
                            ).toLocaleDateString("en-US", { day: "numeric" })}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold">
                            {booking.session.title}
                          </h4>
                            <p className="text-sm text-muted-foreground">
                            {booking.course.title}
                          </p>
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(
                              booking.session.startTime
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          <Dialog
            open={Boolean(previewCertificateUrl)}
            onOpenChange={(open) => {
              if (!open) {
                setPreviewCertificateUrl(null);
                setPreviewCertificateTitle("");
                setPreviewDownloadUrl(null);
              }
            }}
          >
            <DialogContent className="w-[96vw] max-w-6xl h-[90vh] p-0 overflow-hidden flex flex-col gap-0">
              <DialogHeader className="px-6 py-4 border-b bg-slate-50 dark:bg-slate-900/70">
                <DialogTitle className="truncate pr-10 text-lg">
                  Certificate Preview: {previewCertificateTitle}
                </DialogTitle>
                <div className="flex items-center gap-2 pt-2">
                  {previewCertificateUrl ? (
                    <a
                      href={previewCertificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="secondary" className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Open in new tab
                      </Button>
                    </a>
                  ) : null}
                  {previewDownloadUrl ? (
                    <a href={previewDownloadUrl}>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                    </a>
                  ) : null}
                </div>
              </DialogHeader>

              {previewCertificateUrl ? (
                <iframe
                  src={`${previewCertificateUrl}#view=FitH`}
                  title="Certificate Preview"
                  className="w-full flex-1 border-0 bg-slate-100"
                  loading="lazy"
                />
              ) : null}
            </DialogContent>
          </Dialog>

          {activeTab === "wishlist" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-2xl font-bold text-foreground">
                My Wishlist
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {initialData.wishlist?.length === 0 ? (
                  <p className="col-span-full text-muted-foreground">
                    Your wishlist is empty.
                  </p>
                ) : (
                  initialData.wishlist?.map((item: any) => (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-lg"
                    >
                      <div className="relative aspect-video bg-muted">
                        <img
                          src={item.course.thumbnail || "/default-coures.jpg"}
                          alt={item.course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold line-clamp-1 mb-1">
                          {item.course.title}
                        </h4>
                        <p className="mb-3 text-lg font-bold text-green-600">
                          {new Intl.NumberFormat("en-NP", {
                            style: "currency",
                            currency: "NPR",
                            maximumFractionDigits: 2,
                          }).format(Number(item.course.price))}
                        </p>
                        <Link href={`/courses/${item.courseId}`}>
                          <Button className="w-full">View Course</Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "personal" && (
            <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="mb-2 text-2xl font-bold text-foreground">
                Personal Information
              </h3>
              <p className="mb-8 text-muted-foreground">
                Update your personal details below.
              </p>

              {profileMessage.text && (
                <div
                  className={`mb-6 p-4 rounded-lg text-sm ${
                    profileMessage.type === "success"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {profileMessage.text}
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={personalData.firstName}
                      onChange={(e) =>
                        setPersonalData({
                          ...personalData,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-foreground transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/70"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={personalData.lastName}
                      onChange={(e) =>
                        setPersonalData({
                          ...personalData,
                          lastName: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-foreground transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/70"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                {/* Read Only Fields */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Mail size={14} className="text-gray-400" />
                    Email Address
                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                      (Cannot be changed)
                    </span>
                  </label>
                  <input
                    type="email"
                    value={initialData.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-border bg-muted px-4 py-3 text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <User size={14} className="text-gray-400" />
                    Username
                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                      (Cannot be changed)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={initialData.username || "Not set"}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-border bg-muted px-4 py-3 text-muted-foreground"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isUpdatingProfile ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="mb-2 text-2xl font-bold text-foreground">
                Security Settings
              </h3>
              <p className="mb-8 text-muted-foreground">
                Manage your password and account security.
              </p>

              {passwordMessage.text && (
                <div
                  className={`mb-6 p-4 rounded-lg text-sm ${
                    passwordMessage.type === "success"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {passwordMessage.text}
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Current Password
                  </label>
                  <div className="relative">
                    <Key
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-border bg-muted px-4 py-3 pl-10 text-foreground transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/70"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-border bg-muted px-4 py-3 pl-10 text-foreground transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/70"
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-border bg-muted px-4 py-3 pl-10 text-foreground transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/70"
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isUpdatingPassword ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
