/**
 * ListCard Component
 * Unified card wrapper for list items with consistent styling and hover effects
 */

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { colors, spacing, borderRadius, shadows, transitions } from '../../theme/tokens';

interface ListCardProps {
  onClick?: () => void;
  children: React.ReactNode;
  showChevron?: boolean;
  isUnread?: boolean;
  disabled?: boolean;
}

export const ListCard: React.FC<ListCardProps> = ({
  onClick,
  children,
  showChevron = true,
  isUnread = false,
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: spacing[3],
        padding: spacing[3],
        backgroundColor: colors.neutral[0],
        border: `1px solid ${isUnread ? colors.primary[200] : colors.border.light}`,
        borderRadius: borderRadius.lg,
        cursor: disabled ? 'default' : onClick ? 'pointer' : 'default',
        transition: `all ${transitions.fast} ease`,
        boxShadow: isHovered && !disabled ? shadows.md : shadows.sm,
        transform: isHovered && !disabled ? 'translateY(-1px)' : 'none',
        opacity: disabled ? 0.6 : 1,
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Unread indicator */}
      {isUnread && (
        <div
          style={{
            position: 'absolute',
            top: spacing[3],
            right: spacing[3],
            width: '8px',
            height: '8px',
            backgroundColor: colors.primary[500],
            borderRadius: '50%',
          }}
        />
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>

      {/* Chevron */}
      {showChevron && onClick && !disabled && (
        <ChevronRight
          size={20}
          color={colors.text.tertiary}
          style={{
            flexShrink: 0,
            transition: `transform ${transitions.fast} ease`,
            transform: isHovered ? 'translateX(2px)' : 'none',
          }}
        />
      )}
    </div>
  );
};

export default ListCard;
