import { cn } from "@/lib/utils";
import { useId } from "react";

type CardIllustrationProps = {
  variant?: "course" | "quiz" | "community";
  className?: string;
};

export function CardIllustration({ variant = "course", className }: CardIllustrationProps) {
  const gradientId = useId();
  const tone =
    variant === "quiz"
      ? "text-primary/30"
      : variant === "community"
      ? "text-accent-foreground/25"
      : "text-primary/25";

  return (
    <svg
      viewBox="0 0 220 180"
      aria-hidden="true"
      className={cn("pointer-events-none absolute -right-6 -top-8 h-32 w-36 opacity-80 transition-transform duration-500 group-hover:scale-110", tone, className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {variant === "course" ? (
        <>
          <path d="M24 44l84-24 84 24-84 24-84-24z" fill="none" stroke={`url(#${gradientId})`} strokeWidth="8" strokeLinejoin="round" />
          <path d="M56 62v34c0 18 22 32 52 32s52-14 52-32V62" fill="none" stroke={`url(#${gradientId})`} strokeWidth="8" strokeLinecap="round" />
          <path d="M182 56v52" fill="none" stroke={`url(#${gradientId})`} strokeWidth="8" strokeLinecap="round" />
          <circle cx="182" cy="118" r="9" fill={`url(#${gradientId})`} />
        </>
      ) : null}

      {variant === "quiz" ? (
        <>
          <rect x="28" y="26" width="130" height="110" rx="16" fill="none" stroke={`url(#${gradientId})`} strokeWidth="8" />
          <circle cx="74" cy="66" r="8" fill={`url(#${gradientId})`} />
          <path d="M94 66h42" fill="none" stroke={`url(#${gradientId})`} strokeWidth="8" strokeLinecap="round" />
          <circle cx="74" cy="96" r="8" fill="none" stroke={`url(#${gradientId})`} strokeWidth="8" />
          <path d="M94 96h42" fill="none" stroke={`url(#${gradientId})`} strokeWidth="8" strokeLinecap="round" />
          <path d="M170 108l14 14 24-26" fill="none" stroke={`url(#${gradientId})`} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}

      {variant === "community" ? (
        <>
          <rect x="26" y="38" width="98" height="70" rx="14" fill="none" stroke={`url(#${gradientId})`} strokeWidth="8" />
          <path d="M56 108l-2 20 18-16" fill="none" stroke={`url(#${gradientId})`} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="110" y="66" width="86" height="62" rx="14" fill="none" stroke={`url(#${gradientId})`} strokeWidth="8" />
          <path d="M138 128l-2 18 16-14" fill="none" stroke={`url(#${gradientId})`} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="64" cy="72" r="7" fill={`url(#${gradientId})`} />
          <circle cx="96" cy="72" r="7" fill={`url(#${gradientId})`} />
          <circle cx="140" cy="98" r="7" fill={`url(#${gradientId})`} />
          <circle cx="172" cy="98" r="7" fill={`url(#${gradientId})`} />
        </>
      ) : null}
    </svg>
  );
}
