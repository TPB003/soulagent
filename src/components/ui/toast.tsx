"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ToastTone = "info" | "success" | "error" | "pending";

export type ToastInput = {
  id?: string;
  tone?: ToastTone;
  title: string;
  detail?: string;
  href?: string;
};

type ToastItem = ToastInput & { id: string; tone: ToastTone; title: string };

type ToastApi = {
  push: (toast: ToastInput) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((toast: ToastInput) => {
    const id = toast.id ?? crypto.randomUUID();
    setToasts((current) => {
      const next = current.filter((item) => item.id !== id);
      next.push({ tone: "info", ...toast, id });
      return next.slice(-3);
    });
  }, []);

  const api = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toaster" aria-live="polite">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    if (toast.tone === "pending") return;
    const timer = window.setTimeout(onDismiss, 4800);
    return () => window.clearTimeout(timer);
  }, [toast.tone, toast.title, toast.detail, onDismiss]);

  return (
    <div className={`toast toast-${toast.tone}`} role="status">
      <span className="toast-mark" aria-hidden="true" />
      <div>
        <p>{toast.title}</p>
        {toast.detail && <p className="toast-detail">{toast.detail}</p>}
        {toast.href && (
          <a href={toast.href} target="_blank" rel="noopener noreferrer">
            在 BaseScan 查看
          </a>
        )}
      </div>
      <button type="button" className="toast-x" onClick={onDismiss} aria-label="关闭通知">
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("ToastProvider missing");
  return ctx;
}

function txErrorText(error: { message?: string; shortMessage?: string }) {
  const raw = error.shortMessage || error.message || "未知错误";
  if (/user rejected|user denied|rejected the request/i.test(raw)) return "你取消了这笔交易";
  if (/insufficient funds/i.test(raw)) return "余额不够支付这笔费用";
  return raw.slice(0, 140);
}

export function useTxToast(state: {
  id?: string;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error?: { message?: string; shortMessage?: string } | null;
  hash?: string;
  success: string;
  pending?: string;
  confirming?: string;
}) {
  const { push } = useToast();
  const { id = "tx", isPending, isConfirming, isSuccess, error, hash, success, pending, confirming } = state;

  useEffect(() => {
    if (error) {
      push({ id, tone: "error", title: "交易没有完成", detail: txErrorText(error) });
      return;
    }
    if (isSuccess) {
      push({
        id,
        tone: "success",
        title: success,
        href: hash ? `https://sepolia.basescan.org/tx/${hash}` : undefined,
      });
      return;
    }
    if (isConfirming) {
      push({ id, tone: "pending", title: confirming ?? "交易已提交，正在确认" });
      return;
    }
    if (isPending) {
      push({ id, tone: "pending", title: pending ?? "请在钱包里确认" });
    }
  }, [id, isPending, isConfirming, isSuccess, error, hash, success, pending, confirming, push]);
}
