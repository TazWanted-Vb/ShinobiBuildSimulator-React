"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "error" | "warning" | "success" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getToastStyles = (type: ToastType) => {
    const baseStyles = "fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slide-up";

    const typeStyles = {
      error: "bg-red-600 text-white border-2 border-red-400",
      warning: "bg-yellow-600 text-white border-2 border-yellow-400",
      success: "bg-green-600 text-white border-2 border-green-400",
      info: "bg-blue-600 text-white border-2 border-blue-400",
    };

    return `${baseStyles} ${typeStyles[type]}`;
  };

  const getIcon = (type: ToastType) => {
    const icons = {
      error: "⚠️",
      warning: "⚡",
      success: "✓",
      info: "ℹ️",
    };
    return icons[type];
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={getToastStyles(toast.type)}
            onClick={() => removeToast(toast.id)}
            role="alert"
            aria-live="polite"
          >
            <span className="text-xl">{getIcon(toast.type)}</span>
            <span className="font-medium">{toast.message}</span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
  );
}
