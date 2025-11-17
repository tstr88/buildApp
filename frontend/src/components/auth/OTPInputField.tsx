import { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface OTPInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function OTPInputField({ value, onChange, onComplete, error, disabled = false }: OTPInputFieldProps) {
  const { t } = useTranslation();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [localValues, setLocalValues] = useState<string[]>(['', '', '', '', '', '']);

  // Sync with external value
  useEffect(() => {
    const digits = value.split('').slice(0, 6);
    const newValues = [...digits, ...Array(6 - digits.length).fill('')];
    setLocalValues(newValues);
  }, [value]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, inputValue: string) => {
    // Only allow digits
    const digit = inputValue.replace(/\D/g, '').slice(0, 1);

    const newValues = [...localValues];
    newValues[index] = digit;
    setLocalValues(newValues);

    const fullValue = newValues.join('');
    onChange(fullValue);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (fullValue.length === 6 && onComplete) {
      onComplete(fullValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!localValues[index] && index > 0) {
        // If current box is empty, go back and clear previous
        const newValues = [...localValues];
        newValues[index - 1] = '';
        setLocalValues(newValues);
        onChange(newValues.join(''));
        inputRefs.current[index - 1]?.focus();
      } else if (localValues[index]) {
        // Clear current box
        const newValues = [...localValues];
        newValues[index] = '';
        setLocalValues(newValues);
        onChange(newValues.join(''));
      }
    }
    // Handle arrow keys
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const digits = paste.replace(/\D/g, '').slice(0, 6);

    const newValues = [...digits.split(''), ...Array(6 - digits.length).fill('')];
    setLocalValues(newValues);
    onChange(digits);

    // Focus the next empty input or the last one
    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Auto-submit if complete
    if (digits.length === 6 && onComplete) {
      onComplete(digits);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: 500,
        marginBottom: '8px',
        color: '#222',
      }}>
        {t('auth.otpLabel')}
      </label>
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'space-between',
      }}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={localValues[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            style={{
              width: '48px',
              height: '48px',
              fontSize: '20px',
              fontWeight: 600,
              textAlign: 'center',
              border: error ? '2px solid #DC2626' : '1px solid #E6E6E6',
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: disabled ? '#F2F2F2' : '#FFFFFF',
              color: '#222',
              transition: 'border-color 200ms ease',
            }}
            onFocus={(e) => {
              e.target.select();
              if (!error) {
                e.target.style.borderColor = '#2563EB';
                e.target.style.borderWidth = '2px';
              }
            }}
            onBlur={(e) => {
              if (!error) {
                e.target.style.borderColor = '#E6E6E6';
                e.target.style.borderWidth = '1px';
              }
            }}
          />
        ))}
      </div>
      {error && (
        <p style={{
          marginTop: '8px',
          fontSize: '14px',
          color: '#DC2626',
          textAlign: 'center',
        }}>
          {error}
        </p>
      )}
    </div>
  );
}
