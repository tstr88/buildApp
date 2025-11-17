/**
 * TrustLabelBadge Component
 * Shows supplier trust metric badges
 */

import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface TrustLabelBadgeProps {
  label: string;
  percentage: number;
  sampleSize: number;
  type: 'spec' | 'ontime' | 'issue';
}

export function TrustLabelBadge({ label, percentage, sampleSize, type }: TrustLabelBadgeProps) {
  // Don't show if sample size is too small
  if (sampleSize < 3) {
    return null;
  }

  const getColorAndDot = () => {
    let color = colors.neutral[400];
    let dotColor = colors.neutral[400];

    if (type === 'spec' || type === 'ontime') {
      // Higher is better
      if (percentage >= 90) {
        color = colors.success[700];
        dotColor = colors.success[500];
      } else if (percentage >= 70) {
        color = colors.warning[700];
        dotColor = colors.warning[500];
      } else {
        color = colors.error[700];
        dotColor = colors.error[500];
      }
    } else {
      // Issue rate: Lower is better
      if (percentage <= 5) {
        color = colors.success[700];
        dotColor = colors.success[500];
      } else if (percentage <= 15) {
        color = colors.warning[700];
        dotColor = colors.warning[500];
      } else {
        color = colors.error[700];
        dotColor = colors.error[500];
      }
    }

    return { color, dotColor };
  };

  const { color, dotColor } = getColorAndDot();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing[1],
        padding: `${spacing[1]} ${spacing[2]}`,
        backgroundColor: colors.neutral[50],
        borderRadius: borderRadius.full,
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: dotColor,
        }}
      />
      <span
        style={{
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
          color,
        }}
      >
        {label}: {Math.round(percentage)}%
      </span>
    </div>
  );
}
