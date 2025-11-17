/**
 * PillSelector Component
 * Pill-style button selector for single or multi-select options
 */

import React from 'react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

export interface PillOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface PillSelectorProps {
  label: string;
  options: PillOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiSelect?: boolean;
  error?: string;
}

export const PillSelector: React.FC<PillSelectorProps> = ({
  label,
  options,
  value,
  onChange,
  multiSelect = false,
  error,
}) => {
  const handleClick = (optionValue: string) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
    }
  };

  const isSelected = (optionValue: string): boolean => {
    if (multiSelect) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };

  return (
    <div style={{ marginBottom: spacing[4] }}>
      {/* Label */}
      <label
        style={{
          display: 'block',
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          color: colors.text.primary,
          marginBottom: spacing[2],
        }}
      >
        {label}
      </label>

      {/* Pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing[2],
        }}
      >
        {options.map((option) => {
          const selected = isSelected(option.value);
          const disabled = option.disabled || false;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => !disabled && handleClick(option.value)}
              disabled={disabled}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: selected
                  ? colors.neutral[0]
                  : disabled
                  ? colors.text.disabled
                  : colors.text.primary,
                backgroundColor: selected
                  ? colors.primary[600]
                  : disabled
                  ? colors.neutral[100]
                  : colors.neutral[0],
                border: `1px solid ${
                  selected
                    ? colors.primary[600]
                    : error
                    ? colors.error
                    : colors.border.light
                }`,
                borderRadius: borderRadius.full,
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 200ms ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (!disabled && !selected) {
                  e.currentTarget.style.backgroundColor = colors.neutral[50];
                  e.currentTarget.style.borderColor = colors.primary[300];
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled && !selected) {
                  e.currentTarget.style.backgroundColor = colors.neutral[0];
                  e.currentTarget.style.borderColor = error
                    ? colors.error
                    : colors.border.light;
                }
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
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.error,
            margin: `${spacing[1]} 0 0 0`,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};
