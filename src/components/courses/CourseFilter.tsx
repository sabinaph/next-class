'use client';

import { useState } from 'react';
import { CourseFilters } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Filter, X } from 'lucide-react';
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

export default function CourseFilter({ onFilterChange, isLoading = false }: CourseFilterProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [level, setLevel] = useState('All Levels');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const applyFilters = () => {
    const filters: CourseFilters = {};
    
    if (search.trim()) filters.search = search.trim();
    if (category !== 'All Categories') filters.category = category;
    if (level !== 'All Levels') filters.level = level;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    
    onFilterChange(filters);
    setIsMobileOpen(false); // Close mobile sheet on apply
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('All Categories');
    setLevel('All Levels');
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
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Levels */}
      <div className="space-y-2">
        <Label htmlFor="level">Level</Label>
        <select
          id="level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          disabled={isLoading}
           className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {levels.map((lvl) => (
            <option key={lvl} value={lvl}>{lvl}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Price Range</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
             <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">$</span>
            <Input
              type="number"
              placeholder="Min"
              className="pl-6"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
              disabled={isLoading}
            />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">$</span>
            <Input
              type="number"
              placeholder="Max"
              className="pl-6"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
              disabled={isLoading}
            />
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
      <Card className="hidden lg:block h-fit sticky top-24 border-none shadow-nav bg-card/50 backdrop-blur-sm">
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
            <Button variant="outline" className="w-full gap-2">
              <Filter className="h-4 w-4" />
              Filters & Search
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
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
