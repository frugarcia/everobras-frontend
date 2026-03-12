import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { X, AlertTriangle, CheckCircle } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "error" | "success";
}

interface ToastContextType {
  showToast: (message: string, type?: "error" | "success") => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-bottom-2 ${
              toast.type === "error"
                ? "bg-destructive/10 border-destructive/30 text-destructive"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            {toast.type === "error" ? (
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />
            )}
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-md p-0.5 hover:bg-black/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
