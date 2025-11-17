/**
 * Toggle Component
 * On/off toggle switch
 */

import React from 'react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  description?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  description,
}) => {
  return (
    <div style={{ marginBottom: spacing[4] }}>
      {/* Label and Toggle Container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing[3],
        }}
      >
        {/* Label */}
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: disabled ? colors.text.disabled : colors.text.primary,
              marginBottom: description ? spacing[1] : 0,
            }}
          >
            {label}
          </label>
          {description && (
            <p
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.text.tertiary,
                margin: 0,
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={value}
          onClick={() => !disabled && onChange(!value)}
          disabled={disabled}
          style={{
            position: 'relative',
            width: '48px',
            height: '24px',
            backgroundColor: value
              ? colors.primary[600]
              : disabled
              ? colors.neutral[200]
              : colors.neutral[300],
            borderRadius: borderRadius.full,
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'background-color 200ms ease',
            outline: 'none',
          }}
          onFocus={(e) => {
            if (!disabled) {
              e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Toggle Knob */}
          <span
            style={{
              position: 'absolute',
              top: '2px',
              left: value ? '26px' : '2px',
              width: '20px',
              height: '20px',
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.full,
              transition: 'left 200ms ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
            }}
          />
        </button>
      </div>
    </div>
  );
};
