/**
 * InfoRow Component
 * Unified info display row with icon and text
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { colors, spacing, typography } from '../../theme/tokens';

interface InfoRowProps {
  icon?: LucideIcon;
  label?: string;
  value: React.ReactNode;
  color?: string;
  iconColor?: string;
  size?: 'sm' | 'md';
}

export const InfoRow: React.FC<InfoRowProps> = ({
  icon: Icon,
  label,
  value,
  color = colors.text.primary,
  iconColor = colors.text.tertiary,
  size = 'md',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
      }}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} color={iconColor} />}
      {label && (
        <span
          style={{
            fontSize:
              size === 'sm' ? typography.fontSize.xs : typography.fontSize.sm,
            color: colors.text.secondary,
          }}
        >
          {label}:
        </span>
      )}
      <span
        style={{
          fontSize:
            size === 'sm' ? typography.fontSize.xs : typography.fontSize.sm,
          color: color,
          fontWeight: label ? typography.fontWeight.medium : typography.fontWeight.normal,
        }}
      >
        {value}
      </span>
    </div>
  );
};

export default InfoRow;
