/**
 * StatusBadge Component
 * Unified status badge/chip for consistent status display across all pages
 */

import React from 'react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

export type StatusType =
  | 'active'
  | 'pending'
  | 'confirmed'
  | 'scheduled'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'expired'
  | 'closed'
  | 'disputed'
  | 'new'
  | 'quoted'
  | 'accepted'
  | 'rejected'
  | 'ready'
  | 'picked_up';

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  // Success states
  active: {
    bg: colors.success[50],
    text: colors.success[700],
    border: colors.success[200],
  },
  confirmed: {
    bg: colors.success[50],
    text: colors.success[700],
    border: colors.success[200],
  },
  completed: {
    bg: colors.success[50],
    text: colors.success[700],
    border: colors.success[200],
  },
  accepted: {
    bg: colors.success[50],
    text: colors.success[700],
    border: colors.success[200],
  },
  picked_up: {
    bg: colors.success[50],
    text: colors.success[700],
    border: colors.success[200],
  },

  // Primary states
  scheduled: {
    bg: colors.primary[50],
    text: colors.primary[700],
    border: colors.primary[200],
  },
  quoted: {
    bg: colors.primary[50],
    text: colors.primary[700],
    border: colors.primary[200],
  },

  // Info states
  in_transit: {
    bg: colors.info[50],
    text: colors.info[700],
    border: colors.info[200],
  },
  delivered: {
    bg: colors.info[50],
    text: colors.info[700],
    border: colors.info[200],
  },
  ready: {
    bg: colors.info[50],
    text: colors.info[700],
    border: colors.info[200],
  },

  // Warning states
  pending: {
    bg: colors.warning[50],
    text: colors.warning[700],
    border: colors.warning[200],
  },
  new: {
    bg: colors.warning[50],
    text: colors.warning[700],
    border: colors.warning[200],
  },

  // Error states
  cancelled: {
    bg: colors.error[50],
    text: colors.error[700],
    border: colors.error[200],
  },
  expired: {
    bg: colors.error[50],
    text: colors.error[700],
    border: colors.error[200],
  },
  disputed: {
    bg: colors.error[50],
    text: colors.error[700],
    border: colors.error[200],
  },
  rejected: {
    bg: colors.error[50],
    text: colors.error[700],
    border: colors.error[200],
  },

  // Neutral states
  closed: {
    bg: colors.neutral[100],
    text: colors.text.secondary,
    border: colors.neutral[200],
  },
};

const defaultConfig = {
  bg: colors.neutral[100],
  text: colors.text.secondary,
  border: colors.neutral[200],
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
}) => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  const config = statusConfig[normalizedStatus] || defaultConfig;

  const displayLabel =
    label || status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding:
          size === 'sm'
            ? `${spacing[0.5]} ${spacing[2]}`
            : `${spacing[1]} ${spacing[3]}`,
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        borderRadius: borderRadius.full,
        fontSize: size === 'sm' ? typography.fontSize.xs : typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}
    >
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
