/**
 * ListCard Component
 * Modern unified card wrapper for list items with left accent indicator
 * Matches the design pattern from RFQs, Orders, MyRentals pages
 */

import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { colors, spacing, borderRadius, shadows, transitions } from '../../theme/tokens';

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

interface ListCardProps {
  onClick?: () => void;
  children: React.ReactNode;
  showChevron?: boolean;
  isUnread?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  accentColor?: 'primary' | 'success' | 'warning' | 'error';
}

export const ListCard: React.FC<ListCardProps> = ({
  onClick,
  children,
  showChevron = true,
  isUnread = false,
  isActive = false,
  disabled = false,
  accentColor = 'primary',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();

  // Determine if we need attention indicator
  const needsAttention = isUnread || isActive;

  // Get accent color based on prop
  const getAccentColor = () => {
    switch (accentColor) {
      case 'success':
        return colors.success[500];
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error[500];
      default:
        return colors.primary[500];
    }
  };

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
        padding: isMobile ? spacing[4] : spacing[5],
        backgroundColor: isHovered && !disabled ? colors.neutral[50] : colors.neutral[0],
        border: `1px solid ${colors.border.light}`,
        borderLeft: !isMobile && needsAttention
          ? `4px solid ${getAccentColor()}`
          : `1px solid ${colors.border.light}`,
        borderRadius: borderRadius.lg,
        cursor: disabled ? 'default' : onClick ? 'pointer' : 'default',
        transition: `all ${transitions.fast} ease`,
        boxShadow: isHovered && !disabled ? shadows.md : shadows.sm,
        opacity: disabled ? 0.6 : 1,
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Content wrapper with optional dot indicator for mobile */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
        {/* Mobile dot indicator */}
        {isMobile && needsAttention && (
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: borderRadius.full,
              backgroundColor: getAccentColor(),
              flexShrink: 0,
              marginTop: '6px',
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>

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
