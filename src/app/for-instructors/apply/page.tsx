"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function InstructorApplyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    countryLocation: "",
    currentJob: "",
    yearsOfExperience: "",
    areaOfExpertise: "",
    shortBio: "",
    courseTitle: "",
    courseCategory: "Programming",
    courseLevel: "Beginner",
    courseDescription: "",
    hasTaughtBefore: false,
    teachingExperienceDetails: "",
    previousCourseLinks: "",
    portfolioLinks: "",
    sampleVideoFileUrl: "",
    sampleVideoLink: "",
    hasRecordingEquipment: false,
    willCreateVideoCourses: false,
    canPromoteCourse: false,
    socialMediaLinks: "",
    agreedToTerms: false,
    agreedToRevenueShare: false,
    studyBackground: "",
    hobbies: "",
  });

  const categories = [
    "Programming",
    "Marketing",
    "Design",
    "Business",
    "Data Science",
    "Other",
  ];

  const handleSampleVideoUpload = async (file: File) => {
    setIsUploadingVideo(true);
    setErrorMessage("");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await fetch("/api/instructor-applications/upload", {
        method: "POST",
        body: uploadData,
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        url?: string;
      };

      if (!response.ok || !result.success || !result.url) {
        throw new Error(result.error || "Video upload failed");
      }

      setFormData((prev) => ({ ...prev, sampleVideoFileUrl: result.url || "" }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Video upload failed");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/instructor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          yearsOfExperience: Number(formData.yearsOfExperience),
        }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to submit application");
      }

      setSuccessMessage(
        "Your application was submitted. Admin will review it and notify you by email."
      );
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        countryLocation: "",
        currentJob: "",
        yearsOfExperience: "",
        areaOfExpertise: "",
        shortBio: "",
        courseTitle: "",
        courseCategory: "Programming",
        courseLevel: "Beginner",
        courseDescription: "",
        hasTaughtBefore: false,
        teachingExperienceDetails: "",
        previousCourseLinks: "",
        portfolioLinks: "",
        sampleVideoFileUrl: "",
        sampleVideoLink: "",
        hasRecordingEquipment: false,
        willCreateVideoCourses: false,
        canPromoteCourse: false,
        socialMediaLinks: "",
        agreedToTerms: false,
        agreedToRevenueShare: false,
        studyBackground: "",
        hobbies: "",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to submit application"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Instructor Application Form</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill all required details. We will review your application within 2-5 days.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border bg-card p-6">
        {successMessage ? (
          <div className="rounded-md border border-green-300/50 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-300">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <div className="space-y-6">
          <div className="space-y-4 rounded-xl border p-4">
            <h2 className="text-lg font-semibold">1. Basic Information</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" required value={formData.fullName} onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" required value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" required value={formData.phoneNumber} onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="countryLocation">Country / Location</Label>
                <Input id="countryLocation" required value={formData.countryLocation} onChange={(e) => setFormData((prev) => ({ ...prev, countryLocation: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border p-4">
            <h2 className="text-lg font-semibold">2. Professional Background</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentJob">Current Job / Profession</Label>
                <Input id="currentJob" required value={formData.currentJob} onChange={(e) => setFormData((prev) => ({ ...prev, currentJob: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input id="yearsOfExperience" type="number" min={0} required value={formData.yearsOfExperience} onChange={(e) => setFormData((prev) => ({ ...prev, yearsOfExperience: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="areaOfExpertise">Area of Expertise</Label>
                <Input id="areaOfExpertise" required value={formData.areaOfExpertise} onChange={(e) => setFormData((prev) => ({ ...prev, areaOfExpertise: e.target.value }))} placeholder="e.g., Programming, Marketing, Design" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="shortBio">Short Bio</Label>
                <Textarea id="shortBio" rows={3} required value={formData.shortBio} onChange={(e) => setFormData((prev) => ({ ...prev, shortBio: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="studyBackground">Study Background</Label>
                <Textarea id="studyBackground" rows={3} required value={formData.studyBackground} onChange={(e) => setFormData((prev) => ({ ...prev, studyBackground: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="hobbies">Hobbies</Label>
                <Textarea id="hobbies" rows={2} required value={formData.hobbies} onChange={(e) => setFormData((prev) => ({ ...prev, hobbies: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border p-4">
            <h2 className="text-lg font-semibold">3. Course Details</h2>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="courseTitle">Course Title</Label>
                <Input id="courseTitle" required value={formData.courseTitle} onChange={(e) => setFormData((prev) => ({ ...prev, courseTitle: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseCategory">Course Category</Label>
                <select id="courseCategory" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.courseCategory} onChange={(e) => setFormData((prev) => ({ ...prev, courseCategory: e.target.value }))}>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseLevel">Course Level</Label>
                <select id="courseLevel" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.courseLevel} onChange={(e) => setFormData((prev) => ({ ...prev, courseLevel: e.target.value }))}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="courseDescription">Course Description</Label>
                <Textarea id="courseDescription" rows={4} required value={formData.courseDescription} onChange={(e) => setFormData((prev) => ({ ...prev, courseDescription: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border p-4">
            <h2 className="text-lg font-semibold">4. Teaching Experience</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Have you taught before?</Label>
                <div className="flex gap-6 text-sm">
                  <label className="flex items-center gap-2"><input type="radio" checked={formData.hasTaughtBefore} onChange={() => setFormData((prev) => ({ ...prev, hasTaughtBefore: true }))} />Yes</label>
                  <label className="flex items-center gap-2"><input type="radio" checked={!formData.hasTaughtBefore} onChange={() => setFormData((prev) => ({ ...prev, hasTaughtBefore: false }))} />No</label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teachingExperienceDetails">Teaching Experience Details</Label>
                <Textarea id="teachingExperienceDetails" rows={3} value={formData.teachingExperienceDetails} onChange={(e) => setFormData((prev) => ({ ...prev, teachingExperienceDetails: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousCourseLinks">Links to previous courses (optional)</Label>
                <Textarea id="previousCourseLinks" rows={2} value={formData.previousCourseLinks} onChange={(e) => setFormData((prev) => ({ ...prev, previousCourseLinks: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolioLinks">Portfolio / Work samples (optional)</Label>
                <Textarea id="portfolioLinks" rows={2} value={formData.portfolioLinks} onChange={(e) => setFormData((prev) => ({ ...prev, portfolioLinks: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border p-4">
            <h2 className="text-lg font-semibold">5. Content Quality Check</h2>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="sampleVideoUpload">Upload Sample Video</Label>
                <Input id="sampleVideoUpload" type="file" accept="video/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { void handleSampleVideoUpload(file); } }} />
                {isUploadingVideo ? <p className="text-xs text-muted-foreground">Uploading sample video...</p> : null}
                {formData.sampleVideoFileUrl ? <p className="text-xs text-green-700 dark:text-green-300">Uploaded: {formData.sampleVideoFileUrl}</p> : null}
              </div>
              <p className="text-xs text-muted-foreground">OR</p>
              <div className="space-y-2">
                <Label htmlFor="sampleVideoLink">Provide Video Link (YouTube/Drive)</Label>
                <Input id="sampleVideoLink" value={formData.sampleVideoLink} onChange={(e) => setFormData((prev) => ({ ...prev, sampleVideoLink: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border p-4">
            <h2 className="text-lg font-semibold">6. Technical Setup</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Do you have recording equipment?</Label>
                <div className="flex gap-6 text-sm">
                  <label className="flex items-center gap-2"><input type="radio" checked={formData.hasRecordingEquipment} onChange={() => setFormData((prev) => ({ ...prev, hasRecordingEquipment: true }))} />Yes</label>
                  <label className="flex items-center gap-2"><input type="radio" checked={!formData.hasRecordingEquipment} onChange={() => setFormData((prev) => ({ ...prev, hasRecordingEquipment: false }))} />No</label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Will you create video-based courses?</Label>
                <div className="flex gap-6 text-sm">
                  <label className="flex items-center gap-2"><input type="radio" checked={formData.willCreateVideoCourses} onChange={() => setFormData((prev) => ({ ...prev, willCreateVideoCourses: true }))} />Yes</label>
                  <label className="flex items-center gap-2"><input type="radio" checked={!formData.willCreateVideoCourses} onChange={() => setFormData((prev) => ({ ...prev, willCreateVideoCourses: false }))} />No</label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border p-4">
            <h2 className="text-lg font-semibold">7. Marketing Contribution (Optional)</h2>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Can you promote your course?</Label>
                <div className="flex gap-6 text-sm">
                  <label className="flex items-center gap-2"><input type="radio" checked={formData.canPromoteCourse} onChange={() => setFormData((prev) => ({ ...prev, canPromoteCourse: true }))} />Yes</label>
                  <label className="flex items-center gap-2"><input type="radio" checked={!formData.canPromoteCourse} onChange={() => setFormData((prev) => ({ ...prev, canPromoteCourse: false }))} />No</label>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="socialMediaLinks">Social Media Links (optional)</Label>
                <Textarea id="socialMediaLinks" rows={2} value={formData.socialMediaLinks} onChange={(e) => setFormData((prev) => ({ ...prev, socialMediaLinks: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border p-4">
            <h2 className="text-lg font-semibold">8. Agreement</h2>
            <div className="space-y-3 text-sm">
              <label className="flex items-start gap-2"><input type="checkbox" checked={formData.agreedToTerms} onChange={(e) => setFormData((prev) => ({ ...prev, agreedToTerms: e.target.checked }))} /><span>I agree to platform terms.</span></label>
              <label className="flex items-start gap-2"><input type="checkbox" checked={formData.agreedToRevenueShare} onChange={(e) => setFormData((prev) => ({ ...prev, agreedToRevenueShare: e.target.checked }))} /><span>I accept revenue share (60% instructor / 40% platform).</span></label>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={isLoading || isUploadingVideo} className="w-full md:w-auto">
          {isLoading ? "Submitting..." : "Submit Application"}
        </Button>

        <p className="text-xs text-muted-foreground">We will review your application within 2-5 days.</p>
      </form>
    </div>
  );
}
