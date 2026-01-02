"use client";

import { CourseWithInstructor } from "@/types";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, Users, BookOpen } from "lucide-react";

interface CourseCardProps {
  course: CourseWithInstructor;
}

export default function CourseCard({ course }: CourseCardProps) {
  const {
    id,
    title,
    shortDescription,
    description,
    category,
    level,
    thumbnail,
    price,
    duration,
    instructor,
    _count,
  } = course;

  // Get level badge variant/color
  const getLevelBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case "beginner":
        return "secondary"; // or a custom class if badge supports it
      case "intermediate":
        return "default";
      case "advanced":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Link href={`/courses/${id}`}>
      <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 group border-border/50 bg-card/50 hover:bg-card hover:-translate-y-1">
        {/* Thumbnail Section */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
              <BookOpen className="w-12 h-12 text-muted-foreground/20" />
            </div>
          )}

          <div className="absolute top-2 left-2 z-10">
            <Badge
              variant="secondary"
              className="bg-white/90 dark:bg-black/90 backdrop-blur-sm shadow-sm font-semibold"
            >
              {category}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <CardHeader className="p-5 pb-2 space-y-2.5">
          <div className="flex justify-between items-start gap-2">
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0 h-5 font-medium uppercase tracking-wider text-muted-foreground border-border/60"
            >
              {level}
            </Badge>
            <div className="flex items-center text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-full">
              <Clock className="w-3 h-3 mr-1" />
              {duration}h
            </div>
          </div>

          <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
            {title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {shortDescription || description}
          </p>
        </CardHeader>

        <CardContent className="p-5 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage
                src={instructor.image || undefined}
                alt={instructor.firstName}
              />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {instructor.firstName[0]}
                {instructor.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">
                {instructor.firstName} {instructor.lastName}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                Instructor
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0 mt-auto flex items-center justify-between border-t border-border/50 bg-muted/5 pt-4">
          <div className="flex flex-col">
            {price > 0 ? (
              <span className="text-lg font-bold text-primary">
                ${price.toFixed(2)}
              </span>
            ) : (
              <span className="text-lg font-bold text-green-600 dark:text-green-500">
                Free
              </span>
            )}
            {_count && (
              <span className="text-xs text-muted-foreground flex items-center mt-0.5">
                <Users className="w-3 h-3 mr-1" />
                {_count.bookings} students
              </span>
            )}
          </div>

          <Button
            size="sm"
            className="font-semibold shadow-sm group-hover:shadow-md transition-all"
          >
            View Course
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
