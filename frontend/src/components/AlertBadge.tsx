/**
 * Alert Badge Component
 * Displays warning/error badges for critical metrics
 */

import React from 'react';
import { colors, spacing, typography, borderRadius } from '../theme/tokens';

interface AlertBadgeProps {
  count: number;
  severity?: 'warning' | 'error' | 'info';
  label?: string;
}

export function AlertBadge({ count, severity = 'error', label }: AlertBadgeProps) {
  if (count === 0) {
    return null;
  }

  const getColors = () => {
    switch (severity) {
      case 'error':
        return {
          bg: colors.error[100],
          text: colors.error[700],
          border: colors.error[200],
        };
      case 'warning':
        return {
          bg: colors.warning[100],
          text: colors.warning[700],
          border: colors.warning[200],
        };
      case 'info':
        return {
          bg: colors.info[100],
          text: colors.info[700],
          border: colors.info[200],
        };
      default:
        return {
          bg: colors.neutral[100],
          text: colors.neutral[700],
          border: colors.neutral[200],
        };
    }
  };

  const colorScheme = getColors();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing[2],
        padding: `${spacing[1]} ${spacing[3]}`,
        backgroundColor: colorScheme.bg,
        border: `1px solid ${colorScheme.border}`,
        borderRadius: borderRadius.full,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colorScheme.text,
      }}
    >
      {label && <span>{label}:</span>}
      <span>{count}</span>
    </div>
  );
}
