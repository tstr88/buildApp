/**
 * NotificationBell Component
 * Displays notification count badge
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../icons/Icons';
import { colors, transitions, borderRadius } from '../../theme/tokens';

interface NotificationBellProps {
  count?: number;
  onClick?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ count = 0, onClick }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/notifications');
    }
  };

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
        backgroundColor: isHovered ? colors.neutral[100] : 'transparent',
        borderRadius: borderRadius.full,
        cursor: 'pointer',
        transition: `all ${transitions.fast} ease`,
        WebkitTapHighlightColor: 'transparent',
      }}
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
    >
      <Icons.Bell
        size={20}
        strokeWidth={2}
        color={count > 0 ? colors.primary[600] : colors.text.secondary}
        style={{
          transition: `all ${transitions.fast} ease`,
        }}
      />

      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
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
            boxShadow: `0 0 0 2px ${colors.neutral[0]}`,
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};
