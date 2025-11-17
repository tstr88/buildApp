/**
 * ExpiryCountdown Component
 * Shows countdown timer for offer expiry
 */

import { useState, useEffect } from 'react';
import { colors, typography } from '../../theme/tokens';

interface ExpiryCountdownProps {
  expiresAt: string;
  onExpire?: () => void;
}

export function ExpiryCountdown({ expiresAt, onExpire }: ExpiryCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const difference = expiry - now;

      if (difference <= 0) {
        setTimeLeft('Expired');
        setIsExpired(true);
        if (onExpire) {
          onExpire();
        }
        return;
      }

      // Check if expiring soon (< 24 hours)
      const hoursLeft = Math.floor(difference / (1000 * 60 * 60));
      setIsExpiringSoon(hoursLeft < 24);

      // Calculate time components
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const getColor = () => {
    if (isExpired) return colors.neutral[400];
    if (isExpiringSoon) return colors.warning;
    return colors.text.secondary;
  };

  return (
    <span
      style={{
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: getColor(),
      }}
    >
      {isExpired ? 'Expired' : `Expires in ${timeLeft}`}
    </span>
  );
}
