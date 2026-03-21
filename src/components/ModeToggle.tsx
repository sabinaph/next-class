"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative rounded-lg border border-border/70 bg-muted/70 p-2 text-foreground transition hover:bg-muted"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 text-foreground transition-all dark:-rotate-90 dark:scale-0 dark:text-muted-foreground" />
      <Moon className="absolute top-2 h-5 w-5 rotate-90 scale-0 text-muted-foreground transition-all dark:rotate-0 dark:scale-100 dark:text-foreground" />
    </button>
  );
}

export function SimpleModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder to prevent layout shift
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full text-muted-foreground transition-colors hover:bg-muted"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
