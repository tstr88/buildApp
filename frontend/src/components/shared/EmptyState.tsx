/**
 * EmptyState Component
 * Unified empty state display for list pages
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
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
        padding: spacing[12],
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        boxShadow: shadows.sm,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.neutral[100],
          borderRadius: borderRadius.full,
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
          margin: 0,
          marginBottom: spacing[2],
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            margin: 0,
            marginBottom: action ? spacing[4] : 0,
            maxWidth: '300px',
          }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;
