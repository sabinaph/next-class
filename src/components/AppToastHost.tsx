"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { subscribeToast } from "@/lib/toast";

interface AppToastItem {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info";
  durationMs: number;
}

export default function AppToastHost() {
  const [toasts, setToasts] = useState<AppToastItem[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToast((toast) => {
      setToasts((prev) => [...prev, toast]);

      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, toast.durationMs);
    });

    return unsubscribe;
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-80 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-in slide-in-from-top-3 fade-in-0 duration-300"
        >
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md",
              toast.type === "success" &&
                "border-emerald-300/70 bg-emerald-50/95 dark:border-emerald-800 dark:bg-emerald-950/90",
              toast.type === "error" &&
                "border-rose-300/70 bg-rose-50/95 dark:border-rose-800 dark:bg-rose-950/90",
              toast.type === "info" &&
                "border-sky-300/70 bg-sky-50/95 dark:border-sky-800 dark:bg-sky-950/90"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 rounded-full p-1.5",
                  toast.type === "success" &&
                    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/70 dark:text-emerald-300",
                  toast.type === "error" &&
                    "bg-rose-100 text-rose-700 dark:bg-rose-900/70 dark:text-rose-300",
                  toast.type === "info" &&
                    "bg-sky-100 text-sky-700 dark:bg-sky-900/70 dark:text-sky-300"
                )}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : toast.type === "error" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold leading-none">{toast.title}</p>
                  {toast.type === "success" && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() =>
                  setToasts((prev) => prev.filter((item) => item.id !== toast.id))
                }
                className="text-muted-foreground hover:text-foreground text-sm"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
