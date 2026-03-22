"use client";

import { ReactNode } from "react";

/**
 * Wraps content with suppressHydrationWarning to prevent hydration mismatches
 * caused by browser extensions modifying the DOM (e.g., Bitwarden adding bis_skin_checked attributes)
 */
export function HydrationBoundary({ children }: { children: ReactNode }) {
  return <div suppressHydrationWarning>{children}</div>;
}
