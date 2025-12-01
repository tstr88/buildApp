/**
 * NotificationBell Component
 * Displays notification count badge with support for light/dark variants
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../icons/Icons';
import { colors, transitions, borderRadius } from '../../theme/tokens';

interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
  variant?: 'default' | 'light';
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  count = 0,
  onClick,
  variant = 'default',
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Ensure count is a proper number (handle string/bigint from API)
  const numericCount = typeof count === 'string' ? parseInt(count, 10) : Number(count) || 0;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/notifications');
    }
  };

  const isLight = variant === 'light';

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        border: 'none',
        backgroundColor: isHovered
          ? (isLight ? 'rgba(255, 255, 255, 0.2)' : colors.neutral[100])
          : 'transparent',
        borderRadius: borderRadius.full,
        cursor: 'pointer',
        transition: `all ${transitions.fast} ease`,
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={`Notifications${numericCount > 0 ? ` (${numericCount} unread)` : ''}`}
    >
      <Icons.Bell
        size={20}
        strokeWidth={2}
        color={isLight
          ? colors.neutral[0]
          : (numericCount > 0 ? colors.primary[600] : colors.text.secondary)
        }
        style={{
          transition: `all ${transitions.fast} ease`,
        }}
      />

      {numericCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            backgroundColor: colors.error[500] || colors.error,
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
            boxShadow: isLight
              ? `0 0 0 2px ${colors.primary[600]}`
              : `0 0 0 2px ${colors.neutral[0]}`,
          }}
        >
          {numericCount > 99 ? '99+' : numericCount}
        </span>
      )}
    </button>
  );
};
