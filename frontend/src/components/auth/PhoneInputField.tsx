import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface PhoneInputFieldProps {
  value: string; // Full phone number with +995 prefix
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function PhoneInputField({ value, onChange, error, disabled = false }: PhoneInputFieldProps) {
  const { t } = useTranslation();
  const [localValue, setLocalValue] = useState('');

  // Format the input to display without +995 prefix
  useEffect(() => {
    if (value.startsWith('+995')) {
      const digits = value.substring(4);
      // Format as XXX XX XX XX
      const formatted = formatPhoneDisplay(digits);
      setLocalValue(formatted);
    } else {
      setLocalValue('');
    }
  }, [value]);

  const formatPhoneDisplay = (digits: string): string => {
    // Remove all non-digits
    const clean = digits.replace(/\D/g, '');

    // Format as XXX XX XX XX
    if (clean.length <= 3) return clean;
    if (clean.length <= 5) return `${clean.slice(0, 3)} ${clean.slice(3)}`;
    if (clean.length <= 7) return `${clean.slice(0, 3)} ${clean.slice(3, 5)} ${clean.slice(5)}`;
    return `${clean.slice(0, 3)} ${clean.slice(3, 5)} ${clean.slice(5, 7)} ${clean.slice(7, 9)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Allow only digits and spaces
    const cleaned = input.replace(/[^\d\s]/g, '');

    // Remove spaces to get just digits
    const digits = cleaned.replace(/\s/g, '');

    // Limit to 9 digits
    const limited = digits.substring(0, 9);

    // Format for display
    const formatted = formatPhoneDisplay(limited);
    setLocalValue(formatted);

    // Pass the full phone number with +995 prefix
    onChange(limited ? `+995${limited}` : '');
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');

    // Extract digits
    let digits = paste.replace(/\D/g, '');

    // If it starts with 995, remove it
    if (digits.startsWith('995')) {
      digits = digits.substring(3);
    }

    // Limit to 9 digits
    const limited = digits.substring(0, 9);

    // Format for display
    const formatted = formatPhoneDisplay(limited);
    setLocalValue(formatted);
    onChange(limited ? `+995${limited}` : '');
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
        {t('auth.phoneLabel')}
      </label>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#222',
          fontSize: '16px',
          fontWeight: 500,
          pointerEvents: 'none',
        }}>
          +995
        </div>
        <input
          type="tel"
          inputMode="numeric"
          value={localValue}
          onChange={handleChange}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder={t('auth.phonePlaceholder')}
          style={{
            width: '100%',
            height: '48px',
            paddingLeft: '60px',
            paddingRight: '12px',
            fontSize: '16px',
            border: error ? '2px solid #DC2626' : '1px solid #E6E6E6',
            borderRadius: '8px',
            outline: 'none',
            backgroundColor: disabled ? '#F2F2F2' : '#FFFFFF',
            color: '#222',
            transition: 'border-color 200ms ease',
          }}
          onFocus={(e) => {
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
      </div>
      {error ? (
        <p style={{
          marginTop: '4px',
          fontSize: '14px',
          color: '#DC2626',
        }}>
          {error}
        </p>
      ) : (
        <p style={{
          marginTop: '4px',
          fontSize: '14px',
          color: '#757575',
        }}>
          {t('auth.phoneExample')}
        </p>
      )}
    </div>
  );
}
