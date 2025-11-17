/**
 * OTP Input Component
 * 6-digit OTP input with auto-focus
 */

import React, { useRef, useState, KeyboardEvent } from 'react';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handleChange = (index: number, inputValue: string) => {
    if (disabled) return;

    // Only allow digits
    const digit = inputValue.replace(/\D/g, '').slice(-1);

    const newValue = value.split('');
    newValue[index] = digit;

    const finalValue = newValue.join('').slice(0, length);
    onChange(finalValue);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pastedData);

    // Focus the next empty input or last input
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div style={{ marginBottom: spacing[4] }}>
      <div
        style={{
          display: 'flex',
          gap: spacing[2],
          justifyContent: 'center',
        }}
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            disabled={disabled}
            style={{
              width: '48px',
              height: '56px',
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              textAlign: 'center',
              color: disabled ? colors.text.disabled : colors.text.primary,
              backgroundColor: disabled ? colors.neutral[50] : colors.neutral[0],
              border: `2px solid ${
                error
                  ? colors.error
                  : focusedIndex === index
                  ? colors.primary[500]
                  : colors.border.default
              }`,
              borderRadius: borderRadius.md,
              outline: 'none',
              transition: 'border-color 200ms ease',
            }}
          />
        ))}
      </div>

      {error && (
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.error,
            margin: `${spacing[2]} 0 0 0`,
            textAlign: 'center',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};
