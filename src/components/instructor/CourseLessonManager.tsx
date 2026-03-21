"use client";

import { useState } from "react";
import { Lesson, LessonType } from "@/types";
import { createLesson, updateLesson, deleteLesson } from "@/actions/instructor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pencil,
  Trash,
  Plus,
  Video,
  FileText,
  File,
  GripVertical,
  CheckCircle2,
  CircleDashed,
  X,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { showToast } from "@/lib/toast";

interface CourseLessonManagerProps {
  courseId: string;
  initialLessons: Lesson[];
}

export function CourseLessonManager({
  courseId,
  initialLessons,
}: CourseLessonManagerProps) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [type, setType] = useState<LessonType>("VIDEO");
  const [content, setContent] = useState("");
  const [duration, setDuration] = useState<number | "">("");
  const [order, setOrder] = useState<number>(1);
  const [isPublished, setIsPublished] = useState(true);
  const [isFree, setIsFree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Reset form helper
  const resetForm = () => {
    setTitle("");
    setType("VIDEO");
    setContent("");
    setDuration("");
    setOrder(1);
    setIsPublished(true);
    setIsFree(false);
    setIsAdding(false);
    setEditingLesson(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createLesson(courseId, title, type, content, {
        duration: duration === "" ? undefined : Number(duration),
        isPublished,
        isFree,
      });
      window.location.reload();
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Lesson Not Added",
        message: "Failed to add lesson.",
      });
    } finally {
      setIsLoading(false);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await deleteLesson(id);
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleTogglePublish = async (lesson: Lesson) => {
    try {
      await updateLesson(lesson.id, {
        isPublished: !lesson.isPublished,
      });
      window.location.reload();
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Publish Update Failed",
        message: "Failed to update lesson publish status.",
      });
    }
  };

  const handleEditClick = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setTitle(lesson.title);
    setType(lesson.type);
    setContent(lesson.content || "");
    setDuration(lesson.duration ?? "");
    setOrder(lesson.order);
    setIsPublished(lesson.isPublished);
    setIsFree(lesson.isFree);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;

    setIsLoading(true);
    try {
      await updateLesson(editingLesson.id, {
        title,
        type,
        content,
        duration: duration === "" ? undefined : Number(duration),
        order,
        isPublished,
        isFree,
      });
      window.location.reload();
    } catch (error) {
      console.error(error);
      showToast({
        type: "error",
        title: "Lesson Update Failed",
        message: "Failed to update lesson.",
      });
    } finally {
      setIsLoading(false);
      resetForm();
    }
  };

  const uploadLessonFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
    lessonType: LessonType
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", lessonType === "VIDEO" ? "video" : "pdf");

      const response = await fetch("/api/local-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Upload failed.");
      }

      const payload = (await response.json()) as { url?: string };
      if (!payload.url) {
        throw new Error("Upload did not return a file URL.");
      }

      setContent(payload.url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      showToast({
        type: "error",
        title: "Upload Failed",
        message,
      });
    } finally {
      setIsUploadingFile(false);
      event.target.value = "";
    }
  };

  const getIcon = (t: LessonType) => {
    switch (t) {
      case "VIDEO":
        return <Video className="h-5 w-5" />;
      case "PDF":
        return <File className="h-5 w-5" />;
      case "QUIZ":
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (t: LessonType) => {
    switch (t) {
      case "VIDEO":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "PDF":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "QUIZ":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Course Lessons</CardTitle>
            <CardDescription>
              Manage and organize the content for your course.
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsAdding(!isAdding);
            }}
            size="sm"
            className="gap-2"
            disabled={isAdding}
          >
            <Plus className="h-4 w-4" /> Add Lesson
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        {isAdding && (
          <div className="rounded-xl border bg-card text-card-foreground shadow animate-in slide-in-from-top-2">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">New Lesson</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetForm}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Lesson Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Introduction to React Hooks"
                      required
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Lesson Type</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={type}
                      onChange={(e) => setType(e.target.value as LessonType)}
                    >
                      <option value="VIDEO">Video Lesson</option>
                      <option value="TEXT">Article / Text</option>
                      <option value="PDF">PDF Resource</option>
                      <option value="QUIZ">Quiz / Assessment</option>
                      <option value="ASSIGNMENT">Assignment</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={duration}
                      onChange={(e) =>
                        setDuration(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="inline-flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                    />
                    Published
                  </label>

                  <label className="inline-flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                    />
                    Free Preview
                  </label>
                </div>

                {/* Content Input or Uploader */}
                <div className="space-y-2">
                  <Label>Content & Materials</Label>
                  {type === "VIDEO" || type === "PDF" ? (
                    <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors">
                      {content ? (
                        <div className="text-center w-full max-w-sm">
                          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mx-auto mb-3">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-medium mb-1">
                            File uploaded successfully
                          </p>
                          <a
                            href={content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:underline truncate block w-full mb-3"
                          >
                            {content}
                          </a>
                          <Button
                            variant="destructive"
                            type="button"
                            size="sm"
                            onClick={() => setContent("")}
                            className="w-full"
                          >
                            Remove & Upload Different File
                          </Button>
                        </div>
                      ) : (
                        <div className="w-full flex flex-col items-center">
                          <Input
                            type="file"
                            accept={type === "VIDEO" ? "video/*" : "application/pdf"}
                            onChange={(event) => uploadLessonFile(event, type)}
                            disabled={isUploadingFile}
                          />
                          {isUploadingFile && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Uploading file...
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-4 text-center">
                            Upload your{" "}
                            {type === "VIDEO" ? "lesson video" : "PDF document"}{" "}
                            here.
                            <br />
                            Max file size: {type === "VIDEO" ? "512MB" : "16MB"}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter the lesson content, instructions, or quiz details..."
                      className="min-h-[150px] font-mono text-sm"
                    />
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Lesson
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card border rounded-lg hover:border-primary/50 transition-all shadow-sm"
            >
              <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-0">
                <div className="cursor-move text-muted-foreground/30 hover:text-muted-foreground">
                  <GripVertical className="h-5 w-5" />
                </div>

                <div
                  className={`p-2.5 rounded-lg ${getTypeColor(lesson.type)}`}
                >
                  {getIcon(lesson.type)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-base">
                      {lesson.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="bg-muted px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold text-[10px]">
                      {lesson.type}
                    </span>
                    <span>#{lesson.order}</span>
                    {lesson.isFree && <span>• Free</span>}
                    <span className="flex items-center gap-1">
                      {lesson.isPublished ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <CircleDashed className="h-3 w-3 text-yellow-500" />
                      )}
                      {lesson.isPublished ? "Published" : "Draft"}
                    </span>
                    {lesson.duration && <span>• {lesson.duration} min</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => handleTogglePublish(lesson)}
                  title={lesson.isPublished ? "Unpublish lesson" : "Publish lesson"}
                >
                  {lesson.isPublished ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => handleEditClick(lesson)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                  onClick={() => handleDelete(lesson.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {initialLessons.length === 0 && !isAdding && (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-muted/10">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No lessons yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">
                Start building your course content by adding your first lesson.
                Video, text, and PDF formats supported.
              </p>
              <Button onClick={() => setIsAdding(true)}>
                Add First Lesson
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Lesson Dialog */}
      <Dialog open={!!editingLesson} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
            <DialogDescription>
              Make changes to your lesson content. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          {editingLesson && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Lesson Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Lesson Title"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lesson Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={type}
                    onChange={(e) => setType(e.target.value as LessonType)}
                  >
                    <option value="VIDEO">Video Lesson</option>
                    <option value="TEXT">Article / Text</option>
                    <option value="PDF">PDF Resource</option>
                    <option value="QUIZ">Quiz / Assessment</option>
                    <option value="ASSIGNMENT">Assignment</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Order</Label>
                  <Input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value || 1))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) =>
                      setDuration(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-2 flex items-end">
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                      />
                      Published
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={isFree}
                        onChange={(e) => setIsFree(e.target.checked)}
                      />
                      Free Preview
                    </label>
                  </div>
                </div>
              </div>

               <div className="space-y-2">
                  <Label>Content & Materials</Label>
                  {type === "VIDEO" || type === "PDF" ? (
                    <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center bg-muted/20">
                      {content ? (
                        <div className="text-center w-full">
                           <p className="text-xs text-muted-foreground mb-2 truncate max-w-xs mx-auto">
                              Current File: {content}
                           </p>
                          <Button
                            variant="destructive"
                            size="sm"
                            type="button"
                            onClick={() => setContent("")}
                          >
                            Remove & Upload New File
                          </Button>
                        </div>
                      ) : (
                         <div className="w-full flex flex-col items-center">
                          <Input
                            type="file"
                            accept={type === "VIDEO" ? "video/*" : "application/pdf"}
                            onChange={(event) => uploadLessonFile(event, type)}
                            disabled={isUploadingFile}
                          />
                          {isUploadingFile && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Uploading file...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Lesson content..."
                      className="min-h-[150px]"
                    />
                  )}
                </div>

              <DialogFooter>
                 <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
