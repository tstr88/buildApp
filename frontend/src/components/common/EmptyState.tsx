/**
 * EmptyState Component
 * Display when no content is available
 */

import React from 'react';
import { Icons } from '../icons/Icons';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface EmptyStateProps {
  icon?: keyof typeof Icons | React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'Info',
  title,
  description,
  actionLabel,
  onAction,
  action,
}) => {
  const iconIsKey = typeof icon === 'string';
  const Icon = iconIsKey ? Icons[icon as keyof typeof Icons] : null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${spacing[12]} ${spacing[6]}`,
        textAlign: 'center',
      }}
    >
      {/* Icon */}
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
        {iconIsKey && Icon ? (
          <Icon
            size={32}
            strokeWidth={1.5}
            color={colors.text.tertiary}
          />
        ) : (
          icon
        )}
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          margin: 0,
          marginBottom: spacing[2],
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            margin: 0,
            marginBottom: spacing[6],
            maxWidth: '400px',
            lineHeight: typography.lineHeight.relaxed,
          }}
        >
          {description}
        </p>
      )}

      {/* Action Button or Custom Action */}
      {action ? (
        action
      ) : actionLabel && onAction ? (
        <button
          onClick={onAction}
          style={{
            padding: `${spacing[3]} ${spacing[6]}`,
            border: 'none',
            backgroundColor: colors.primary[600],
            color: colors.text.inverse,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.medium,
            borderRadius: borderRadius.md,
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary[700];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary[600];
          }}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
};
