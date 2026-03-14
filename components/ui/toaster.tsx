"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info" | "default";

export type ToastPayload = {
  title?: string;
  description?: string;
  type?: ToastType;
  duration?: number;
};

type ToastItem = ToastPayload & {
  id: string;
  type: ToastType;
};

type ToastListener = (toast: ToastItem) => void;

const listeners = new Set<ToastListener>();

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `toast_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const emitToast = (payload: ToastPayload) => {
  const toast: ToastItem = {
    id: createId(),
    type: payload.type ?? "default",
    title: payload.title,
    description: payload.description,
    duration: payload.duration ?? 5000
  };

  listeners.forEach((listener) => listener(toast));
};

export const toast = {
  show: (payload: ToastPayload) => emitToast(payload),
  success: (title: string, description?: string, duration?: number) =>
    emitToast({ title, description, duration, type: "success" }),
  error: (title: string, description?: string, duration?: number) =>
    emitToast({ title, description, duration, type: "error" }),
  warning: (title: string, description?: string, duration?: number) =>
    emitToast({ title, description, duration, type: "warning" }),
  info: (title: string, description?: string, duration?: number) =>
    emitToast({ title, description, duration, type: "info" }),
  default: (title: string, description?: string, duration?: number) =>
    emitToast({ title, description, duration, type: "default" })
};

const typeStyles: Record<ToastType, string> = {
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-100",
  error: "border-rose-400/30 bg-rose-500/10 text-rose-100",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-100",
  info: "border-cyan-400/30 bg-cyan-400/10 text-cyan-100",
  default: "border-white/10 bg-white/5 text-slate-100"
};

const typeBadge: Record<ToastType, string> = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info",
  default: "Notice"
};

type ToastProviderProps = {
  children: React.ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timeouts = useRef<Record<string, number>>({});

  useEffect(() => {
    const listener: ToastListener = (toastItem) => {
      setItems((prev) => [...prev, toastItem]);

      const timeout = window.setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== toastItem.id));
        delete timeouts.current[toastItem.id];
      }, toastItem.duration ?? 5000);

      timeouts.current[toastItem.id] = timeout;
    };

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
      Object.values(timeouts.current).forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeouts.current = {};
    };
  }, []);

  const dismiss = (id: string) => {
    const timeout = timeouts.current[id];
    if (timeout) {
      window.clearTimeout(timeout);
      delete timeouts.current[id];
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const rendered = useMemo(
    () =>
      items.map((item) => (
        <div
          key={item.id}
          role="status"
          className={`pointer-events-auto relative overflow-hidden rounded-2xl border px-4 py-3 shadow-glass backdrop-blur ${
            typeStyles[item.type]
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-slate-400">{typeBadge[item.type]}</div>
              {item.title ? <div className="mt-2 text-sm font-semibold">{item.title}</div> : null}
              {item.description ? <div className="mt-1 text-xs text-slate-300">{item.description}</div> : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="text-xs uppercase tracking-[0.2em] text-slate-400 transition hover:text-white"
            >
              Close
            </button>
          </div>
        </div>
      )),
    [items]
  );

  return (
    <>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[9999] flex w-[320px] max-w-[90vw] flex-col gap-3 pointer-events-none"
      >
        {rendered}
      </div>
    </>
  );
}
