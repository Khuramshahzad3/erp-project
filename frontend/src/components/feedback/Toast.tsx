import React, { useState, useEffect } from 'react';
import { subscribeToApiErrors } from '../../services/api/axiosInstance';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// Global emitter helper for triggering toast messages programmatically
type ToastListener = (message: string, type: ToastMessage['type']) => void;
const toastListeners = new Set<ToastListener>();

export const triggerToast = (message: string, type: ToastMessage['type'] = 'success') => {
  toastListeners.forEach((listener) => listener(message, type));
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage['type']) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    // Subscribe to manual toast triggers
    const handleTrigger: ToastListener = (message, type) => {
      addToast(message, type);
    };
    toastListeners.add(handleTrigger);

    // Subscribe to Axios response interceptor errors
    const unsubscribeApi = subscribeToApiErrors((message) => {
      addToast(message, 'error');
    });

    return () => {
      toastListeners.delete(handleTrigger);
      unsubscribeApi();
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => {
        const bgColors = {
          success: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          error: 'bg-rose-50 text-rose-900 border-rose-200',
          info: 'bg-sky-50 text-sky-900 border-sky-200',
          warning: 'bg-amber-50 text-amber-900 border-amber-200',
        };

        const Icon = {
          success: CheckCircle,
          error: AlertCircle,
          info: Info,
          warning: AlertCircle,
        }[toast.type];

        const iconColors = {
          success: 'text-emerald-500',
          error: 'text-rose-500',
          info: 'text-sky-500',
          warning: 'text-amber-500',
        };

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 transform translate-y-0 animate-fade-in ${bgColors[toast.type]}`}
          >
            <Icon className={`h-5 w-5 shrink-0 ${iconColors[toast.type]}`} />
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
