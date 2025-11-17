/**
 * Retry Button Component
 * Button with built-in retry logic and loading state
 */

import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';
import { InlineSpinner } from './LoadingSpinner';

interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  showRetryIcon?: boolean;
  style?: React.CSSProperties;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  children = 'Retry',
  variant = 'primary',
  size = 'md',
  disabled = false,
  showRetryIcon = true,
  style,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (isRetrying || disabled) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const variantStyles = {
    primary: {
      backgroundColor: colors.primary[600],
      color: colors.neutral[0],
      border: 'none',
    },
    secondary: {
      backgroundColor: colors.neutral[100],
      color: colors.text.primary,
      border: `1px solid ${colors.border.light}`,
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.primary[600],
      border: `1px solid ${colors.primary[600]}`,
    },
  };

  const sizeStyles = {
    sm: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
    },
    md: {
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
    },
    lg: {
      padding: `${spacing[4]} ${spacing[6]}`,
      fontSize: typography.fontSize.lg,
    },
  };

  return (
    <button
      onClick={handleRetry}
      disabled={isRetrying || disabled}
      style={{
        ...variantStyles[variant],
        ...sizeStyles[size],
        borderRadius: borderRadius.md,
        fontWeight: typography.fontWeight.semibold,
        cursor: isRetrying || disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        opacity: disabled && !isRetrying ? 0.6 : 1,
        transition: 'all 200ms',
        ...style,
      }}
    >
      {isRetrying ? (
        <>
          <InlineSpinner size={16} color={variant === 'primary' ? colors.neutral[0] : colors.primary[600]} />
          Retrying...
        </>
      ) : (
        <>
          {showRetryIcon && <Icons.RotateCcw size={16} />}
          {children}
        </>
      )}
    </button>
  );
};

/**
 * Error State Component with Retry
 * Complete error UI with retry button
 */
interface ErrorStateProps {
  message: string;
  description?: string;
  onRetry?: () => Promise<void> | void;
  retryLabel?: string;
  showIcon?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message,
  description,
  onRetry,
  retryLabel = 'Try Again',
  showIcon = true,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[8],
        textAlign: 'center',
      }}
    >
      {showIcon && (
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: colors.error[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing[4],
          }}
        >
          <Icons.AlertCircle size={24} color={colors.error[600]} />
        </div>
      )}

      <h3
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          marginBottom: spacing[2],
        }}
      >
        {message}
      </h3>

      {description && (
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            marginBottom: spacing[4],
            maxWidth: '400px',
          }}
        >
          {description}
        </p>
      )}

      {onRetry && <RetryButton onRetry={onRetry}>{retryLabel}</RetryButton>}
    </div>
  );
};

/**
 * Empty State Component
 * Displays when no data is available
 */
interface EmptyStateProps {
  icon?: React.ComponentType<{ size: number; color: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Icons.Inbox,
  title,
  description,
  action,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[8],
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: colors.neutral[100],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing[4],
        }}
      >
        <Icon size={32} color={colors.text.tertiary} />
      </div>

      <h3
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          marginBottom: spacing[2],
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            marginBottom: action ? spacing[4] : 0,
            maxWidth: '400px',
          }}
        >
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: `${spacing[3]} ${spacing[5]}`,
            backgroundColor: colors.primary[600],
            color: colors.neutral[0],
            border: 'none',
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
