"use client";

import { useState } from "react";
import { updateCourse } from "@/actions/instructor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface CourseDetailsFormProps {
  course: {
    id: string;
    title: string;
    description: string;
    shortDescription?: string | null;
    category: string;
    tags?: string[];
    level: string;
    thumbnail?: string | null;
    price: number;
    duration: number;
    maxStudents: number;
    prerequisites?: string | null;
    learningOutcomes?: string | null;
    syllabus?: string | null;
    isActive: boolean;
  };
}

export function CourseDetailsForm({ course }: CourseDetailsFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description,
    shortDescription: course.shortDescription || "",
    category: course.category,
    tags: (course.tags || []).join(", "),
    level: course.level,
    thumbnail: course.thumbnail || "",
    price: Number(course.price || 0),
    duration: course.duration,
    maxStudents: course.maxStudents,
    prerequisites: course.prerequisites || "",
    learningOutcomes: course.learningOutcomes || "",
    syllabus: course.syllabus || "",
    isActive: course.isActive,
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target;

    if (type === "checkbox") {
      const checked = (event.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "duration" || name === "maxStudents"
          ? Number(value)
          : value,
    }));
  };

  const handleThumbnailUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setIsUploadingThumbnail(true);

    try {
      const payload = new FormData();
      payload.append("file", file);
      payload.append("kind", "thumbnail");

      const response = await fetch("/api/local-upload", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error || "Thumbnail upload failed.");
      }

      const body = (await response.json()) as { url?: string };
      if (!body.url) {
        throw new Error("Upload did not return a file URL.");
      }

      setFormData((prev) => ({ ...prev, thumbnail: body.url || "" }));
      setSuccess("Thumbnail uploaded.");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Thumbnail upload failed."
      );
    } finally {
      setIsUploadingThumbnail(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      await updateCourse(course.id, {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        level: formData.level,
        thumbnail: formData.thumbnail,
        price: formData.price,
        duration: formData.duration,
        maxStudents: formData.maxStudents,
        prerequisites: formData.prerequisites,
        learningOutcomes: formData.learningOutcomes,
        syllabus: formData.syllabus,
        isActive: formData.isActive,
      });

      setSuccess("Course details updated successfully.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to update course details."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Details</CardTitle>
        <CardDescription>
          Edit all key fields for this course.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-900 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                disabled={isSaving}
                placeholder="Short summary for cards and listings"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isSaving}
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                disabled={isSaving}
                placeholder="Beginner / Intermediate / Advanced"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
                disabled={isSaving}
                placeholder="/uploads/thumbnails/..."
              />
              <Input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                disabled={isUploadingThumbnail || isSaving}
              />
              {isUploadingThumbnail && (
                <p className="text-xs text-muted-foreground">Uploading thumbnail...</p>
              )}
              {formData.thumbnail && (
                <img
                  src={formData.thumbnail}
                  alt="Thumbnail preview"
                  className="h-36 w-full md:w-72 object-cover rounded-md border"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (NPR)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={handleInputChange}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStudents">Max Students</Label>
              <Input
                id="maxStudents"
                name="maxStudents"
                type="number"
                min="1"
                value={formData.maxStudents}
                onChange={handleInputChange}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2 flex items-end">
              <label className="inline-flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  disabled={isSaving}
                />
                Course is active
              </label>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="prerequisites">Prerequisites</Label>
              <Textarea
                id="prerequisites"
                name="prerequisites"
                value={formData.prerequisites}
                onChange={handleInputChange}
                disabled={isSaving}
                className="min-h-[90px]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="learningOutcomes">Learning Outcomes</Label>
              <Textarea
                id="learningOutcomes"
                name="learningOutcomes"
                value={formData.learningOutcomes}
                onChange={handleInputChange}
                disabled={isSaving}
                className="min-h-[90px]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="syllabus">Syllabus</Label>
              <Textarea
                id="syllabus"
                name="syllabus"
                value={formData.syllabus}
                onChange={handleInputChange}
                disabled={isSaving}
                className="min-h-[120px]"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Course Details
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
