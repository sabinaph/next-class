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
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Define the shape of user data passed from the server
interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  bookings: any[]; // We'll type this properly or use 'any' for now to avoid complexity in this file
  wishlist: any[];
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
          ? "bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-md shadow-gray-200/50 dark:shadow-none"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row min-h-[600px]">
      {/* Sidebar / Tabs */}
      <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-2">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 px-2">
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
      <div className="flex-1 p-8 md:p-12 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          {activeTab === "learning" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Learning
              </h3>
              <div className="grid gap-6">
                {initialData.bookings?.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
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
                      <div className="w-full sm:w-48 aspect-video bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {booking.course.thumbnail ? (
                          <img
                            src={booking.course.thumbnail}
                            alt={booking.course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <BookOpen size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-lg line-clamp-1">
                            {booking.course.title}
                          </h4>
                          <p className="text-sm text-gray-500 mb-2">
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
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Upcoming Schedule
              </h3>
              <div className="space-y-4">
                {initialData.bookings?.filter(
                  (b) => new Date(b.session.sessionDate) > new Date()
                ).length === 0 ? (
                  <p className="text-gray-500">
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
                        className="flex items-center gap-4 p-4 border rounded-xl bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="p-3 bg-white dark:bg-gray-700 rounded-lg text-center min-w-[60px]">
                          <div className="text-xs text-gray-500 uppercase font-bold">
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
                          <p className="text-sm text-gray-500">
                            {booking.course.title}
                          </p>
                          <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
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

          {activeTab === "wishlist" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Wishlist
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {initialData.wishlist?.length === 0 ? (
                  <p className="text-gray-500 col-span-full">
                    Your wishlist is empty.
                  </p>
                ) : (
                  initialData.wishlist?.map((item: any) => (
                    <div
                      key={item.id}
                      className="border rounded-xl overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="aspect-video bg-gray-100 relative">
                        {item.course.thumbnail && (
                          <img
                            src={item.course.thumbnail}
                            alt={item.course.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold line-clamp-1 mb-1">
                          {item.course.title}
                        </h4>
                        <p className="text-lg font-bold text-green-600 mb-3">
                          ${item.course.price}
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Personal Information
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
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
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>

                {/* Read Only Fields */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    Email Address
                    <span className="text-xs text-gray-400 font-normal ml-auto">
                      (Cannot be changed)
                    </span>
                  </label>
                  <input
                    type="email"
                    value={initialData.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    Username
                    <span className="text-xs text-gray-400 font-normal ml-auto">
                      (Cannot be changed)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={initialData.username || "Not set"}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed"
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
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Security Settings
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
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
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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
