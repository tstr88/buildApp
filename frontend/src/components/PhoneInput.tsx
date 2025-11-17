import { useState, useEffect } from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function PhoneInput({
  value,
  onChange,
  error,
  disabled = false,
  className = '',
}: PhoneInputProps) {
  const [localValue, setLocalValue] = useState('');

  // Format the input to display without +995 prefix
  useEffect(() => {
    if (value.startsWith('+995')) {
      setLocalValue(value.substring(4));
    } else {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Allow only digits
    const digits = input.replace(/\D/g, '');

    // Limit to 9 digits
    const limited = digits.substring(0, 9);

    setLocalValue(limited);

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

    setLocalValue(limited);
    onChange(limited ? `+995${limited}` : '');
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium mb-2 text-[var(--color-charcoal)]">
        ტელეფონის ნომერი / Phone Number
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-[var(--color-charcoal)] text-sm font-medium">+995</span>
        </div>
        <input
          type="tel"
          inputMode="numeric"
          value={localValue}
          onChange={handleChange}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder="5XX XXX XXX"
          className={`
            block w-full pl-16 pr-4 py-3
            border rounded-lg
            focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-[var(--color-concrete)] focus:ring-[var(--color-action)] focus:border-[var(--color-action)]'
            }
          `}
          maxLength={9}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {!error && localValue.length > 0 && localValue.length < 9 && (
        <p className="mt-1 text-sm text-gray-500">
          {9 - localValue.length} digits remaining
        </p>
      )}
    </div>
  );
}
