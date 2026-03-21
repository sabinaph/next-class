export type AppToastType = "success" | "error" | "info";

export interface AppToastPayload {
  title: string;
  message: string;
  type?: AppToastType;
  durationMs?: number;
}

type ToastListener = (toast: Required<AppToastPayload> & { id: string }) => void;

const listeners = new Set<ToastListener>();

export function subscribeToast(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function showToast(payload: AppToastPayload) {
  const toast: Required<AppToastPayload> & { id: string } = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: payload.title,
    message: payload.message,
    type: payload.type || "info",
    durationMs: payload.durationMs || 3200,
  };

  for (const listener of listeners) {
    listener(toast);
  }
}
