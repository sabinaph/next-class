"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function InstructorApplyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    studyBackground: "",
    hobbies: "",
    expertise: "",
    bio: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/instructor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
        studyBackground: "",
        hobbies: "",
        expertise: "",
        bio: "",
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
          Fill all required details. Admin will review your request and approve or reject it.
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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              required
              value={formData.fullName}
              onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="phoneNumber">Phone Number (optional)</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="studyBackground">Study Background</Label>
            <Textarea
              id="studyBackground"
              required
              rows={3}
              value={formData.studyBackground}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, studyBackground: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="hobbies">Hobbies</Label>
            <Textarea
              id="hobbies"
              required
              rows={2}
              value={formData.hobbies}
              onChange={(e) => setFormData((prev) => ({ ...prev, hobbies: e.target.value }))}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="expertise">Subject Expertise (optional)</Label>
            <Input
              id="expertise"
              value={formData.expertise}
              onChange={(e) => setFormData((prev) => ({ ...prev, expertise: e.target.value }))}
              placeholder="Example: Web Development, Data Analysis"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Short Bio (optional)</Label>
            <Textarea
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? "Submitting..." : "Submit Application"}
        </Button>
      </form>
    </div>
  );
}
