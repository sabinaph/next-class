"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createCourse } from "@/actions/instructor";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Loader2,
  DollarSign,
  Clock,
  Layout,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  level: z.string().min(1, "Level is required"),
  price: z.number().min(0, "Price must be positive"),
  duration: z.number().int().min(1, "Duration must be at least 1 hour"),
});

type FormData = z.infer<typeof formSchema>;

const CATEGORIES = [
  "Development",
  "Business",
  "Finance",
  "Design",
  "Marketing",
  "Photography",
  "Health & Fitness",
  "Music",
  "Teaching & Academics",
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export function CreateCourseForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      level: "",
      price: 0,
      duration: 1,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const course = await createCourse(data);
      router.push(`/instructor/courses/${course.id}`);
    } catch (err) {
      setError("Failed to create course. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Create a New Course
        </h1>
        <p className="text-muted-foreground">
          Fill in the details below to start building your curriculum.
        </p>
      </div>

      <Card className="border-none shadow-nav">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader className="bg-muted/30 pb-8">
            <CardTitle>Course Information</CardTitle>
            <CardDescription>
              Basic details about your course. You can edit this later.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pt-8">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base">
                  Course Title
                </Label>
                <div className="relative">
                  <Input
                    id="title"
                    placeholder="e.g. Complete Web Development Bootcamp 2025"
                    className="pl-10 h-12 text-lg"
                    {...register("title")}
                  />
                  <Layout className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                </div>
                {errors.title && (
                  <p className="text-sm text-red-500 font-medium">
                    {errors.title.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  A catchy title to attract students.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">
                  Detailed Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn, prerequisites, and target audience..."
                  className="min-h-[150px] resize-y"
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 font-medium">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={(val) => setValue("category", val)}
                  defaultValue={watch("category")}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Fallback hidden input for validation if needed, or rely on setValue */}
                <input type="hidden" {...register("category")} />

                {errors.category && (
                  <p className="text-sm text-red-500 font-medium">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Difficulty Level</Label>
                <Select
                  onValueChange={(val) => setValue("level", val)}
                  defaultValue={watch("level")}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" {...register("level")} />

                {errors.level && (
                  <p className="text-sm text-red-500 font-medium">
                    {errors.level.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/20 rounded-xl border border-dashed">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD)</Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-10 h-11"
                    placeholder="0.00"
                    {...register("price", { valueAsNumber: true })}
                  />
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                </div>
                {errors.price && (
                  <p className="text-sm text-red-500 font-medium">
                    {errors.price.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Set to 0 for free courses.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Estimated Duration (hours)</Label>
                <div className="relative">
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    className="pl-10 h-11"
                    placeholder="e.g. 10"
                    {...register("duration", { valueAsNumber: true })}
                  />
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                </div>
                {errors.duration && (
                  <p className="text-sm text-red-500 font-medium">
                    {errors.duration.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
            <Button variant="ghost" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="px-8 font-semibold shadow-lg"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create & Continue
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
