"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "loading";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  txHash?: string;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<Omit<Toast, "id">>) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-400" />,
  error: <XCircle className="h-5 w-5 text-red-400" />,
  warning: <AlertCircle className="h-5 w-5 text-yellow-400" />,
  loading: <Loader2 className="h-5 w-5 text-ayllu-sun animate-spin" />,
};

const bgColors: Record<ToastType, string> = {
  success: "border-green-500/30",
  error: "border-red-500/30",
  warning: "border-yellow-500/30",
  loading: "border-ayllu-sun/30",
};

const EXPLORER_URL = "https://testnet.snowscan.xyz/tx/";

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);

    if (toast.type !== "loading") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Omit<Toast, "id">>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    if (updates.type && updates.type !== "loading") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, updateToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto glass border ${bgColors[toast.type]} rounded-xl p-4 shadow-xl animate-toast-in`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {icons[toast.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-white/50 mt-0.5">{toast.description}</p>
                )}
                {toast.txHash && (
                  <a
                    href={`${EXPLORER_URL}${toast.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-ayllu-sun hover:underline mt-1 inline-block"
                  >
                    Ver en Snowtrace →
                  </a>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-white/30 hover:text-white/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
