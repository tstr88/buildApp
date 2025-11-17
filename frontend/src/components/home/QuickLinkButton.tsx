/**
 * QuickLinkButton Component
 * Quick action buttons for home screen
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../icons/Icons';
import { colors, spacing, shadows, borderRadius, transitions, typography } from '../../theme/tokens';

interface QuickLinkButtonProps {
  icon: keyof typeof Icons;
  label: string;
  path: string;
  badge?: number;
  variant?: 'default' | 'primary';
}

export const QuickLinkButton: React.FC<QuickLinkButtonProps> = ({
  icon,
  label,
  path,
  badge,
  variant = 'default',
}) => {
  const navigate = useNavigate();
  const [isPressed, setIsPressed] = useState(false);
  const Icon = Icons[icon];

  const isPrimary = variant === 'primary';

  return (
    <button
      onClick={() => navigate(path)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing[4],
        border: `1px solid ${isPrimary ? colors.primary[600] : colors.border.light}`,
        backgroundColor: isPressed
          ? isPrimary
            ? colors.primary[700]
            : colors.neutral[100]
          : isPrimary
          ? colors.primary[600]
          : colors.neutral[0],
        borderRadius: borderRadius.md,
        boxShadow: isPressed ? shadows.sm : shadows.base,
        cursor: 'pointer',
        transition: `all ${transitions.fast} ease`,
        transform: isPressed ? 'scale(0.98)' : 'scale(1)',
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={label}
    >
      {/* Left side: Icon + Label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3],
        }}
      >
        {/* Icon Container */}
        <div
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isPrimary ? 'rgba(255, 255, 255, 0.2)' : colors.primary[50],
            borderRadius: borderRadius.base,
          }}
        >
          <Icon
            size={20}
            strokeWidth={2}
            color={isPrimary ? colors.text.inverse : colors.primary[600]}
          />

          {badge && badge > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                backgroundColor: colors.error,
                color: colors.text.inverse,
                fontSize: '10px',
                fontWeight: 700,
                lineHeight: 1,
                padding: '2px 5px',
                borderRadius: borderRadius.full,
                minWidth: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: shadows.sm,
              }}
            >
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </div>

        {/* Label */}
        <span
          style={{
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.medium,
            color: isPrimary ? colors.text.inverse : colors.text.primary,
          }}
        >
          {label}
        </span>
      </div>

      {/* Right side: Arrow */}
      <Icons.ChevronRight
        size={20}
        strokeWidth={2}
        color={isPrimary ? colors.text.inverse : colors.text.tertiary}
      />
    </button>
  );
};
