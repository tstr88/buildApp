/**
 * Action Dropdown Component
 * Reusable dropdown menu for admin queue row actions
 */

import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../icons/Icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

export interface ActionItem {
  id: string;
  label: string;
  icon?: keyof typeof Icons;
  variant?: 'default' | 'danger' | 'warning';
  onClick: () => void;
}

interface ActionDropdownProps {
  actions: ActionItem[];
}

export function ActionDropdown({ actions }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleActionClick = (action: ActionItem) => {
    action.onClick();
    setIsOpen(false);
  };

  const getVariantColor = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return colors.error[600];
      case 'warning':
        return colors.warning[600];
      default:
        return colors.text.primary;
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: spacing[2],
          backgroundColor: 'transparent',
          border: `1px solid ${colors.border.light}`,
          borderRadius: borderRadius.md,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.neutral[100];
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        aria-label="Actions"
      >
        <Icons.MoreVertical size={16} color={colors.text.secondary} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 4px)',
            minWidth: '180px',
            backgroundColor: colors.neutral[0],
            border: `1px solid ${colors.border.light}`,
            borderRadius: borderRadius.md,
            boxShadow: shadows.lg,
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {actions.map((action) => {
            const Icon = action.icon ? Icons[action.icon] : null;
            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                style={{
                  width: '100%',
                  padding: `${spacing[2]} ${spacing[3]}`,
                  backgroundColor: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  fontSize: typography.fontSize.sm,
                  color: getVariantColor(action.variant),
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral[100];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {Icon && <Icon size={16} color={getVariantColor(action.variant)} />}
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
