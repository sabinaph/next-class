"use client";

import { useState, useEffect } from "react";
import {
  CourseWithInstructor,
  CourseFilters,
  PaginatedResponse,
} from "@/types";
import CourseFilter from "@/components/courses/CourseFilter";
import CourseCard from "@/components/courses/CourseCard";
import {
  Loader2,
  SearchX,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseWithInstructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6, // Reduced limit for better grid density visuals on initial load
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<CourseFilters>({});

  // Fetch courses
  const fetchCourses = async (
    page: number = 1,
    currentFilters: CourseFilters = {}
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (currentFilters.search) params.append("search", currentFilters.search);
      if (currentFilters.category)
        params.append("category", currentFilters.category);
      if (currentFilters.level) params.append("level", currentFilters.level);
      if (currentFilters.minPrice !== undefined)
        params.append("minPrice", currentFilters.minPrice.toString());
      if (currentFilters.maxPrice !== undefined)
        params.append("maxPrice", currentFilters.maxPrice.toString());

      const response = await fetch(`/api/courses?${params.toString()}`);

      if (!response.ok) throw new Error("Failed to fetch courses");

      const data: PaginatedResponse<CourseWithInstructor> =
        await response.json();

      if (data.success && data.data) {
        setCourses(data.data);
        if (data.pagination) setPagination(data.pagination);
      } else {
        throw new Error(data.error || "Failed to fetch courses");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses(1, {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (newFilters: CourseFilters) => {
    setFilters(newFilters);
    fetchCourses(1, newFilters);
  };

  const handlePageChange = (newPage: number) => {
    fetchCourses(newPage, filters);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative bg-muted/30 border-b">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent animate-in slide-in-from-bottom-2">
              Expand Your Knowledge
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed animate-in slide-in-from-bottom-3 fade-in duration-500">
              Discover expert-led courses across development, design, business,
              and more. Start your learning journey today.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar Filters */}
          <aside className="h-full">
            <CourseFilter
              onFilterChange={handleFilterChange}
              isLoading={isLoading}
            />
          </aside>

          {/* Main Content */}
          <main className="space-y-8 min-h-[500px]">
            {/* Results Status */}
            {!isLoading && !error && (
              <div className="flex items-center justify-between pb-2 border-b">
                <p className="text-muted-foreground text-sm font-medium">
                  Showing{" "}
                  <span className="text-foreground font-bold">
                    {courses.length}
                  </span>{" "}
                  of{" "}
                  <span className="text-foreground font-bold">
                    {pagination.total}
                  </span>{" "}
                  courses
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in zoom-in-95">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-destructive/10 rounded-full">
                    <SearchX className="h-8 w-8 text-destructive" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-destructive mb-2">
                  Failed to load courses
                </h3>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button
                  onClick={() => fetchCourses(pagination.page, filters)}
                  variant="outline"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Loading Grid */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <div className="space-y-2 p-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                      <div className="flex gap-2 pt-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-[100px]" />
                          <Skeleton className="h-3 w-[80px]" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && courses.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 bg-card border rounded-2xl border-dashed">
                <div className="p-4 bg-muted/50 rounded-full mb-4">
                  <SearchX className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-8">
                  We couldn't find any courses matching your criteria. Try
                  adjusting your filters or search terms.
                </p>
                <Button
                  onClick={() => handleFilterChange({})}
                  variant="secondary"
                >
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Course Grid */}
            {!isLoading && !error && courses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8 border-t">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm font-medium px-4">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
