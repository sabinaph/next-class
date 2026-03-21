'use client';

import { useState } from 'react';
import { CourseFilters } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Filter } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface CourseFilterProps {
  onFilterChange: (filters: CourseFilters) => void;
  isLoading?: boolean;
  instructors?: Array<{ id: string; name: string }>;
}

const categories = [
  'All Categories',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'UI/UX Design',
  'Business',
  'Marketing',
  'Photography',
  'Music',
];

const levels = [
  'All Levels',
  'Beginner',
  'Intermediate',
  'Advanced',
];

const PRICE_MIN = 0;
const PRICE_MAX = 50000;
const PRICE_STEP = 500;

export default function CourseFilter({ onFilterChange, isLoading = false, instructors = [] }: CourseFilterProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [level, setLevel] = useState('All Levels');
  const [tag, setTag] = useState('');
  const [instructorId, setInstructorId] = useState('All Instructors');
  const [resourceType, setResourceType] = useState('All Types');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const parsedMinPrice = minPrice === '' ? PRICE_MIN : Number(minPrice);
  const parsedMaxPrice = maxPrice === '' ? PRICE_MAX : Number(maxPrice);
  const safeMinPrice = Number.isFinite(parsedMinPrice) ? parsedMinPrice : PRICE_MIN;
  const safeMaxPrice = Number.isFinite(parsedMaxPrice) ? parsedMaxPrice : PRICE_MAX;
  const sliderMin = Math.max(PRICE_MIN, Math.min(safeMinPrice, safeMaxPrice));
  const sliderMax = Math.min(PRICE_MAX, Math.max(safeMaxPrice, safeMinPrice));

  const applyFilters = () => {
    const filters: CourseFilters = {};
    
    if (search.trim()) filters.search = search.trim();
    if (category !== 'All Categories') filters.category = category;
    if (tag.trim()) filters.tag = tag.trim();
    if (level !== 'All Levels') filters.level = level;
    if (instructorId !== 'All Instructors') filters.instructorId = instructorId;
    if (resourceType !== 'All Types') filters.resourceType = resourceType as CourseFilters['resourceType'];
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    
    onFilterChange(filters);
    setIsMobileOpen(false); // Close mobile sheet on apply
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('All Categories');
    setTag('');
    setLevel('All Levels');
    setInstructorId('All Instructors');
    setResourceType('All Types');
    setMinPrice('');
    setMaxPrice('');
    onFilterChange({});
    setIsMobileOpen(false);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search titles..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-card dark:text-foreground"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Levels */}
      <div className="space-y-2">
        <Label htmlFor="tag">Tag</Label>
        <Input
          id="tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="e.g. react"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="level">Level</Label>
        <select
          id="level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          disabled={isLoading}
           className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-card dark:text-foreground"
        >
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label htmlFor="resourceType">Resource Type</Label>
        <select
          id="resourceType"
          value={resourceType}
          onChange={(e) => setResourceType(e.target.value)}
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-card dark:text-foreground"
        >
          <option value="All Types">All Types</option>
          <option value="VIDEO">Video</option>
          <option value="TEXT">Text</option>
          <option value="PDF">PDF</option>
          <option value="QUIZ">Quiz</option>
          <option value="ASSIGNMENT">Assignment</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructorId">Instructor</Label>
        <select
          id="instructorId"
          value={instructorId}
          onChange={(e) => setInstructorId(e.target.value)}
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-card dark:text-foreground"
        >
          <option value="All Instructors">All Instructors</option>
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label>Price Range</Label>
        <div className="rounded-xl border border-border/70 bg-muted/25 p-3">
          <div className="mb-3 flex items-center justify-between text-xs font-medium">
            <span className="rounded-md bg-background px-2 py-1 text-foreground">NPR {sliderMin.toLocaleString()}</span>
            <span className="rounded-md bg-background px-2 py-1 text-foreground">NPR {sliderMax.toLocaleString()}</span>
          </div>

          <div className="relative mb-3 h-8">
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />

            <Input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={sliderMin}
              onChange={(e) => {
                const nextMin = Math.min(Number(e.target.value), sliderMax);
                setMinPrice(String(nextMin));
              }}
              disabled={isLoading}
              className="pointer-events-auto absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 appearance-none bg-transparent p-0 accent-primary"
            />
            <Input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={sliderMax}
              onChange={(e) => {
                const nextMax = Math.max(Number(e.target.value), sliderMin);
                setMaxPrice(String(nextMax));
              }}
              disabled={isLoading}
              className="pointer-events-auto absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 appearance-none bg-transparent p-0 accent-primary"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">NPR</span>
            <Input
              type="number"
              placeholder="Min"
              className="pl-6"
              value={minPrice}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setMinPrice('');
                  return;
                }

                const num = Math.max(PRICE_MIN, Math.min(Number(value), sliderMax));
                setMinPrice(String(num));
              }}
              min={PRICE_MIN}
              max={PRICE_MAX}
              disabled={isLoading}
            />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">NPR</span>
            <Input
              type="number"
              placeholder="Max"
              className="pl-6"
              value={maxPrice}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setMaxPrice('');
                  return;
                }

                const num = Math.min(PRICE_MAX, Math.max(Number(value), sliderMin));
                setMaxPrice(String(num));
              }}
              min={PRICE_MIN}
              max={PRICE_MAX}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <Button onClick={applyFilters} disabled={isLoading} className="w-full">
          {isLoading ? 'Loading...' : 'Apply Filters'}
        </Button>
        <Button 
          variant="outline" 
          onClick={resetFilters} 
          disabled={isLoading} 
          className="w-full"
        >
          Reset
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Filter Sidebar */}
      <Card className="hidden lg:block h-fit sticky top-24 border-none bg-card/70 shadow-nav backdrop-blur-sm dark:bg-card/90">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FilterContent />
        </CardContent>
      </Card>

      {/* Mobile Filter Sheet */}
      <div className="lg:hidden mb-6">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full gap-2 dark:border-border dark:bg-card/60 dark:text-foreground">
              <Filter className="h-4 w-4" />
              Filters & Search
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto dark:bg-card dark:text-foreground">
            <SheetHeader className="mb-6">
              <SheetTitle>Filter Courses</SheetTitle>
              <SheetDescription>
                Refine your search to find the perfect course.
              </SheetDescription>
            </SheetHeader>
            <FilterContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
