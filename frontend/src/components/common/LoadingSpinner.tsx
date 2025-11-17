/**
 * Loading Spinner Component
 * Displays loading state with optional message
 */

import React from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography } from '../../theme/tokens';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
  color?: string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  fullScreen = false,
  color = colors.primary[600],
}) => {
  const iconSize = sizeMap[size];

  const spinner = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing[3],
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9998,
        }),
      }}
    >
      <Icons.Loader2
        size={iconSize}
        color={color}
        style={{
          animation: 'spin 1s linear infinite',
        }}
      />
      {message && (
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            margin: 0,
          }}
        >
          {message}
        </p>
      )}

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );

  return spinner;
};

/**
 * Inline Loading Spinner (for buttons, etc.)
 */
export const InlineSpinner: React.FC<{ size?: number; color?: string }> = ({
  size = 16,
  color = colors.neutral[0],
}) => {
  return (
    <>
      <Icons.Loader2
        size={size}
        color={color}
        style={{
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

/**
 * Skeleton Loader (for content placeholders)
 */
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  count = 1,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            width,
            height,
            borderRadius,
            backgroundColor: colors.neutral[200],
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            marginBottom: count > 1 && index < count - 1 ? spacing[2] : 0,
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
};
