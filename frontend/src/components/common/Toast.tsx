/**
 * Toast Notification Component
 * Displays success, error, warning, and info messages
 */

import React, { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number; // in milliseconds, 0 = manual dismiss only
  onClose: (id: string) => void;
}

const toastStyles = {
  success: {
    backgroundColor: colors.success[50],
    borderColor: colors.success[200],
    iconColor: colors.success[600],
    textColor: colors.success[900],
    icon: Icons.CheckCircle,
  },
  error: {
    backgroundColor: colors.error[50],
    borderColor: colors.error[200],
    iconColor: colors.error[600],
    textColor: colors.error[900],
    icon: Icons.AlertCircle,
  },
  warning: {
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[200],
    iconColor: colors.warning[600],
    textColor: colors.warning[900],
    icon: Icons.AlertTriangle,
  },
  info: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
    iconColor: colors.primary[600],
    textColor: colors.primary[900],
    icon: Icons.Info,
  },
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  description,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const style = toastStyles[type];
  const Icon = style.icon;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss if duration > 0
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match animation duration
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        gap: spacing[3],
        padding: spacing[4],
        backgroundColor: style.backgroundColor,
        border: `1px solid ${style.borderColor}`,
        borderRadius: borderRadius.lg,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        minWidth: isMobile ? 'auto' : '320px',
        maxWidth: isMobile ? '100%' : '420px',
        width: isMobile ? '100%' : 'auto',
        boxSizing: 'border-box',
        opacity: isLeaving ? 0 : isVisible ? 1 : 0,
        transform: isLeaving
          ? 'translateY(-100%)'
          : isVisible
          ? 'translateY(0)'
          : 'translateY(-100%)',
        transition: 'opacity 300ms, transform 300ms',
      }}
    >
      {/* Icon */}
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        <Icon size={20} color={style.iconColor} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: style.textColor,
            margin: 0,
            marginBottom: description ? spacing[1] : 0,
          }}
        >
          {message}
        </p>
        {description && (
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: style.textColor,
              margin: 0,
              opacity: 0.9,
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        style={{
          flexShrink: 0,
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: style.iconColor,
          opacity: 0.7,
          transition: 'opacity 200ms',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.7';
        }}
      >
        <Icons.X size={18} />
      </button>
    </div>
  );
};

/**
 * Toast Container Component
 * Manages multiple toasts and their positioning
 */
interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[];
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'top-right',
}) => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile, always center horizontally
  const getMobileStyles = () => {
    if (position.includes('bottom')) {
      return { bottom: spacing[4], left: spacing[4], right: spacing[4] };
    }
    return { top: spacing[4], left: spacing[4], right: spacing[4] };
  };

  const positionStyles = {
    'top-right': { top: spacing[4], right: spacing[4] },
    'top-left': { top: spacing[4], left: spacing[4] },
    'bottom-right': { bottom: spacing[4], right: spacing[4] },
    'bottom-left': { bottom: spacing[4], left: spacing[4] },
    'top-center': { top: spacing[4], left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: spacing[4], left: '50%', transform: 'translateX(-50%)' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        ...(isMobile ? getMobileStyles() : positionStyles[position]),
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[3],
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast {...toast} onClose={onRemove} />
        </div>
      ))}
    </div>
  );
};
