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
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseWithInstructor[]>([]);
  const [instructors, setInstructors] = useState<Array<{ id: string; name: string }>>([]);
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
      if (currentFilters.tag) params.append("tag", currentFilters.tag);
      if (currentFilters.level) params.append("level", currentFilters.level);
      if (currentFilters.instructorId)
        params.append("instructorId", currentFilters.instructorId);
      if (currentFilters.resourceType)
        params.append("resourceType", currentFilters.resourceType);
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
        const instructorOptions = (data.meta?.instructors as
          | Array<{ id: string; name: string }>
          | undefined) || [];
        setInstructors(instructorOptions);
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

  const activeFilters = Object.entries(filters).filter(([, value]) => {
    if (value === undefined || value === null) return false;
    if (typeof value === "string") return value.trim().length > 0;
    return true;
  });

  const filterLabelMap: Record<string, string> = {
    search: "Search",
    category: "Category",
    tag: "Tag",
    level: "Level",
    instructorId: "Instructor",
    resourceType: "Type",
    minPrice: "Min",
    maxPrice: "Max",
  };

  const rangeStart =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const rangeEnd = Math.min(pagination.page * pagination.limit, pagination.total);

  const renderPaginationButtons = () => {
    const pages: number[] = [];
    const start = Math.max(1, pagination.page - 1);
    const end = Math.min(pagination.totalPages, pagination.page + 1);

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border bg-muted/25">
        <div className="pointer-events-none absolute -left-72 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 top-10 h-88 w-88 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-18 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-semibold text-muted-foreground backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Learn From Industry Experts
              </div>
              <h1 className="mb-5 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Expand Your Knowledge
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground md:text-xl">
                Discover expert-led courses across development, design, business,
                and more. Start your learning journey today.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border/70 bg-background/70 p-3 backdrop-blur sm:gap-3 sm:p-4 lg:min-w-[330px]">
              <div className="rounded-xl border border-border/60 bg-card px-3 py-3 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Courses</p>
                <p className="mt-1 text-xl font-bold text-foreground">{pagination.total}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card px-3 py-3 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Instructors</p>
                <p className="mt-1 text-xl font-bold text-foreground">{instructors.length}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card px-3 py-3 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Page</p>
                <p className="mt-1 text-xl font-bold text-foreground">{pagination.page}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
          {/* Sidebar Filters */}
          <aside className="h-fit lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border/70 bg-card/35 p-3 backdrop-blur-sm lg:bg-transparent lg:p-0 lg:border-0">
              <CourseFilter
                onFilterChange={handleFilterChange}
                isLoading={isLoading}
                instructors={instructors}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-8 min-h-[500px]">
            {/* Results Status */}
            {!isLoading && !error && (
              <div className="rounded-2xl border border-border/70 bg-card/50 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {rangeStart}-{rangeEnd} of {pagination.total} courses
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages || 1}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {activeFilters.length > 0
                      ? `${activeFilters.length} active filter${activeFilters.length > 1 ? "s" : ""}`
                      : "No filters applied"}
                  </div>
                </div>

                {activeFilters.length > 0 ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {activeFilters.map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-flex items-center rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground"
                      >
                        {filterLabelMap[key] || key}: {String(value)}
                      </span>
                    ))}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleFilterChange({})}
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : null}
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
                  className="min-w-28"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Loading Grid */}
            {isLoading && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && courses.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border border-dashed bg-card py-20">
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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 animate-in fade-in duration-500">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && pagination.totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border pt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {renderPaginationButtons().map((pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === pagination.page ? "default" : "outline"}
                    size="sm"
                    className="min-w-9"
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                ))}

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
