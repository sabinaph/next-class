"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createInstructorAnnouncement,
  deleteInstructorAnnouncement,
} from "@/actions/instructor-announcements";
import { Trash2, Megaphone } from "lucide-react";

type CourseOption = {
  id: string;
  title: string;
};

type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  courseId: string;
  courseTitle: string;
  createdAt: string;
};

interface AnnouncementManagerProps {
  courses: CourseOption[];
  initialAnnouncements: AnnouncementItem[];
}

export default function AnnouncementManager({
  courses,
  initialAnnouncements,
}: AnnouncementManagerProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    courseId: courses[0]?.id || "",
    title: "",
    content: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    courseId?: string;
    title?: string;
    content?: string;
  }>({});

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    const nextFieldErrors: { courseId?: string; title?: string; content?: string } = {};
    if (!form.courseId) {
      nextFieldErrors.courseId = "Please select a course.";
    }
    if (form.title.trim().length < 5) {
      nextFieldErrors.title = "Title must be at least 5 characters.";
    }
    if (form.content.trim().length < 10) {
      nextFieldErrors.content = "Content must be at least 10 characters.";
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    startTransition(async () => {
      try {
        const created = await createInstructorAnnouncement(form);
        setAnnouncements((prev) => [
          {
            id: created.id,
            title: created.title,
            content: created.content,
            courseId: created.courseId,
            courseTitle: created.course.title,
            createdAt: new Date(created.createdAt).toISOString(),
          },
          ...prev,
        ]);
        setForm((prev) => ({ ...prev, title: "", content: "" }));
        setSuccess("Announcement published.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to publish.");
      }
    });
  };

  const handleDelete = (id: string) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        await deleteInstructorAnnouncement(id);
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        setSuccess("Announcement deleted.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Announcement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <select
                id="course"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.courseId}
                onChange={(e) =>
                  {
                    setForm((prev) => ({ ...prev, courseId: e.target.value }));
                    setFieldErrors((prev) => ({ ...prev, courseId: undefined }));
                  }
                }
                disabled={isPending || courses.length === 0}
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              {fieldErrors.courseId ? (
                <p className="text-xs text-destructive">{fieldErrors.courseId}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) =>
                  {
                    setForm((prev) => ({ ...prev, title: e.target.value }));
                    setFieldErrors((prev) => ({ ...prev, title: undefined }));
                  }
                }
                placeholder="e.g. Live Q&A this Friday"
                disabled={isPending}
              />
              {fieldErrors.title ? (
                <p className="text-xs text-destructive">{fieldErrors.title}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) =>
                  {
                    setForm((prev) => ({ ...prev, content: e.target.value }));
                    setFieldErrors((prev) => ({ ...prev, content: undefined }));
                  }
                }
                placeholder="Write your update for students..."
                rows={5}
                disabled={isPending}
              />
              {fieldErrors.content ? (
                <p className="text-xs text-destructive">{fieldErrors.content}</p>
              ) : null}
            </div>

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </p>
            )}

            <Button type="submit" disabled={isPending || courses.length === 0}>
              {isPending ? "Publishing..." : "Publish Announcement"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Published Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {announcements.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No announcements yet.
            </div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement.id} className="rounded-lg border p-4">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{announcement.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      <Megaphone className="mr-1 inline h-3.5 w-3.5" />
                      {announcement.courseTitle} • {new Date(announcement.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(announcement.id)}
                    disabled={isPending}
                    aria-label="Delete announcement"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {announcement.content}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
