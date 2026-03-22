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
import { CardIllustration } from "@/components/ui/card-illustration";
import { Clock, Users } from "lucide-react";

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

  const formatNPR = (amount: number) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 2,
    }).format(amount);

  const fallbackThumbnail = "/default-coures.jpg";
  const illustrationVariant = (() => {
    const key = `${category || ""} ${level || ""}`.toLowerCase();
    if (key.includes("design") || key.includes("creative") || key.includes("intermediate")) {
      return "community" as const;
    }
    if (key.includes("advanced") || key.includes("data") || key.includes("quiz")) {
      return "quiz" as const;
    }
    return "course" as const;
  })();

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
      <Card className="group relative h-full overflow-hidden border-border/50 bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:bg-card hover:shadow-lg">
        <CardIllustration variant={illustrationVariant} className="-right-8 top-16 h-28 w-32 opacity-70" />
        {/* Thumbnail Section */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <div className="absolute inset-0 z-10 bg-linear-to-tr from-background/10 via-transparent to-primary/10 transition-opacity duration-300 group-hover:opacity-80" />
          <Image
            src={thumbnail || fallbackThumbnail}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          <div className="absolute top-2 left-2 z-10">
            <Badge
              variant="secondary"
              className="border border-border/70 bg-background/90 text-foreground backdrop-blur-sm shadow-sm font-semibold"
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

          <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-12">
            {title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 min-h-10">
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

        <CardFooter className="mt-auto flex items-center justify-between border-t border-border/50 bg-muted/5 p-5 pt-4">
          <div className="flex flex-col">
            {price > 0 ? (
              <span className="text-lg font-bold text-primary">
                {formatNPR(Number(price))}
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
