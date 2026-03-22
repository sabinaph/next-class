import Link from "next/link";
import { GraduationCap, Home, Search } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute -left-24 -top-20 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />

      <section className="relative w-full max-w-2xl rounded-3xl border bg-card/90 p-8 text-center shadow-sm backdrop-blur md:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border bg-background text-primary">
          <GraduationCap className="h-8 w-8" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Error 404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Page Not Found</h1>
        <p className="mt-4 text-sm text-muted-foreground md:text-base">
          The page you are looking for does not exist or may have been moved.
          Try one of these destinations.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link href="/" className={cn(buttonVariants(), "gap-2")}>
            <Home className="h-4 w-4" />
            Home
          </Link>

          <Link href="/courses" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
            <Search className="h-4 w-4" />
            Explore Courses
          </Link>

          <Link href="/community" className={cn(buttonVariants({ variant: "secondary" }), "gap-2")}>
            <GraduationCap className="h-4 w-4" />
            Community
          </Link>
        </div>
      </section>
    </div>
  );
}
