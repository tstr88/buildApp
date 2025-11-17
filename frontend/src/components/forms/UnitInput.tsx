/**
 * UnitInput Component
 * Number input with unit suffix (e.g., "მ" for meters)
 */

import React from 'react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface UnitInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export const UnitInput: React.FC<UnitInputProps> = ({
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step = 0.1,
  placeholder,
  error,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    } else if (e.target.value === '') {
      onChange(0);
    }
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

      {/* Input with Unit Suffix */}
      <div style={{ position: 'relative' }}>
        <input
          type="number"
          value={value || ''}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            padding: `${spacing[3]} ${spacing[12]} ${spacing[3]} ${spacing[3]}`,
            fontSize: typography.fontSize.base,
            color: disabled ? colors.text.disabled : colors.text.primary,
            backgroundColor: disabled ? colors.neutral[50] : colors.neutral[0],
            border: `1px solid ${error ? colors.error : colors.border.light}`,
            borderRadius: borderRadius.md,
            outline: 'none',
            transition: 'border-color 200ms ease',
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = colors.primary[500];
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = colors.border.light;
            }
          }}
        />

        {/* Unit Suffix */}
        <span
          style={{
            position: 'absolute',
            right: spacing[3],
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            pointerEvents: 'none',
          }}
        >
          {unit}
        </span>
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

      {/* Min/Max Helper Text */}
      {(min !== undefined || max !== undefined) && !error && (
        <p
          style={{
            fontSize: typography.fontSize.xs,
            color: colors.text.tertiary,
            margin: `${spacing[1]} 0 0 0`,
          }}
        >
          {min !== undefined && max !== undefined
            ? `${min} - ${max} ${unit}`
            : min !== undefined
            ? `Min: ${min} ${unit}`
            : `Max: ${max} ${unit}`}
        </p>
      )}
    </div>
  );
};
