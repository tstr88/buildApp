import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Update local state when value prop changes
  useEffect(() => {
    const otpArray = value.split('').slice(0, length);
    const paddedArray = [...otpArray, ...Array(length - otpArray.length).fill('')];
    setOtp(paddedArray);
  }, [value, length]);

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;

    // Allow only digits
    if (digit && !/^\d$/.test(digit)) return;

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Notify parent
    onChange(newOtp.join(''));

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();

      const newOtp = [...otp];

      if (otp[index]) {
        // Clear current field
        newOtp[index] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
      } else if (index > 0) {
        // Move to previous field and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        onChange(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    // Handle right arrow
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (disabled) return;

    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/\D/g, '').slice(0, length);

    if (digits) {
      const newOtp = digits.split('').concat(Array(length - digits.length).fill(''));
      setOtp(newOtp);
      onChange(newOtp.join(''));

      // Focus the next empty field or the last field
      const nextIndex = Math.min(digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    // Select the content on focus for easy replacement
    inputRefs.current[index]?.select();
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium mb-2 text-[var(--color-charcoal)]">
        დამადასტურებელი კოდი / Verification Code
      </label>
      <div className="flex gap-2 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            className={`
              w-12 h-14 text-center text-xl font-semibold
              border-2 rounded-lg
              focus:outline-none focus:ring-2
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all
              ${
                error
                  ? 'border-red-500 focus:ring-red-500'
                  : digit
                  ? 'border-[var(--color-action)] focus:ring-[var(--color-action)]'
                  : 'border-[var(--color-concrete)] focus:ring-[var(--color-action)]'
              }
            `}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
