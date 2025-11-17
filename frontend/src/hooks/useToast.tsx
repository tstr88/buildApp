/**
 * Toast Hook
 * Provides easy access to toast notifications throughout the app
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer } from '../components/common/Toast';
import type { ToastType } from '../components/common/Toast';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (
    type: ToastType,
    message: string,
    options?: { description?: string; duration?: number }
  ) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastIdCounter = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (
      type: ToastType,
      message: string,
      options?: { description?: string; duration?: number }
    ) => {
      const id = `toast-${++toastIdCounter}`;
      const newToast: Toast = {
        id,
        type,
        message,
        description: options?.description,
        duration: options?.duration ?? (type === 'error' ? 10000 : 5000),
      };

      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const success = useCallback(
    (message: string, description?: string) => {
      showToast('success', message, { description, duration: 3000 });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, description?: string) => {
      showToast('error', message, { description, duration: 10000 });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, description?: string) => {
      showToast('warning', message, { description, duration: 5000 });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, description?: string) => {
      showToast('info', message, { description, duration: 5000 });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} position="top-right" />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
