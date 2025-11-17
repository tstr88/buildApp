/**
 * Notification Component
 * Shows success, error, info, and warning notifications
 */

import React, { useEffect } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  onClose: () => void;
  duration?: number; // Auto-close after duration in ms (0 = no auto-close)
}

export const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      bgColor: colors.success[50],
      borderColor: colors.success[200],
      iconColor: colors.success[600],
      titleColor: colors.success[900],
      messageColor: colors.success[700],
      Icon: Icons.CheckCircle,
    },
    error: {
      bgColor: colors.error[50],
      borderColor: colors.error[200],
      iconColor: colors.error[600],
      titleColor: colors.error[900],
      messageColor: colors.error[700],
      Icon: Icons.XCircle,
    },
    info: {
      bgColor: colors.info[50],
      borderColor: colors.info[200],
      iconColor: colors.info[600],
      titleColor: colors.info[900],
      messageColor: colors.info[700],
      Icon: Icons.Info,
    },
    warning: {
      bgColor: colors.warning[50],
      borderColor: colors.warning[200],
      iconColor: colors.warning[600],
      titleColor: colors.warning[900],
      messageColor: colors.warning[700],
      Icon: Icons.AlertTriangle,
    },
  };

  const { bgColor, borderColor, iconColor, titleColor, messageColor, Icon } = config[type];

  return (
    <div
      style={{
        position: 'fixed',
        top: spacing[6],
        right: spacing[6],
        zIndex: 9999,
        minWidth: '320px',
        maxWidth: '480px',
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.lg,
        padding: spacing[4],
        display: 'flex',
        gap: spacing[3],
        alignItems: 'flex-start',
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <Icon size={24} color={iconColor} style={{ flexShrink: 0, marginTop: '2px' }} />

      <div style={{ flex: 1 }}>
        <h4
          style={{
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            color: titleColor,
            margin: 0,
            marginBottom: message ? spacing[1] : 0,
          }}
        >
          {title}
        </h4>
        {message && (
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: messageColor,
              margin: 0,
            }}
          >
            {message}
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: spacing[1],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-label="Close notification"
      >
        <Icons.X size={18} color={iconColor} />
      </button>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
