/**
 * Confirmation Bar Component
 * 24-hour countdown with Confirm/Dispute buttons
 */

import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface ConfirmationBarProps {
  deliveredAt: string;
  onConfirm: () => void;
  onDispute: () => void;
  isSubmitting?: boolean;
  canConfirm?: boolean; // Only ordering phone can confirm
}

export const ConfirmationBar: React.FC<ConfirmationBarProps> = ({
  deliveredAt,
  onConfirm,
  onDispute,
  isSubmitting = false,
  canConfirm = true,
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const deliveryTime = new Date(deliveredAt).getTime();
      const expirationTime = deliveryTime + 24 * 60 * 60 * 1000; // 24 hours
      const now = Date.now();
      const diff = expirationTime - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining('Auto-confirmed');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s remaining`);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [deliveredAt]);

  if (isExpired) {
    return (
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: colors.neutral[100],
          border: `1px solid ${colors.border.light}`,
          borderRadius: borderRadius.lg,
          padding: spacing[4],
          boxShadow: shadows.lg,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <Icons.CheckCircle size={20} color={colors.success[600]} />
          <p
            style={{
              fontSize: typography.fontSize.base,
              color: colors.text.secondary,
              margin: 0,
            }}
          >
            Order automatically confirmed after 24 hours
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: colors.warning[50],
        border: `2px solid ${colors.warning[300]}`,
        borderRadius: borderRadius.lg,
        padding: spacing[4],
        boxShadow: shadows.xl,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing[3],
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <Icons.Clock size={24} color={colors.warning[700]} />
          <div>
            <h4
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.warning[900],
                margin: 0,
                marginBottom: spacing[0.5],
              }}
            >
              Confirm Delivery
            </h4>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.warning[800],
                margin: 0,
              }}
            >
              {timeRemaining}
            </p>
          </div>
        </div>
      </div>

      {!canConfirm && (
        <div
          style={{
            padding: spacing[3],
            backgroundColor: colors.neutral[100],
            borderRadius: borderRadius.md,
            marginBottom: spacing[3],
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <Icons.Info size={16} color={colors.text.tertiary} />
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              margin: 0,
            }}
          >
            Only the phone number that placed the order can confirm delivery
          </p>
        </div>
      )}

      <p
        style={{
          fontSize: typography.fontSize.sm,
          color: colors.warning[900],
          margin: 0,
          marginBottom: spacing[3],
        }}
      >
        Please confirm that you received the order in good condition. If there are any issues,
        please report a dispute.
      </p>

      <div
        className="confirmation-buttons"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: spacing[3],
        }}
      >
        <style>{`
          @media (min-width: 640px) {
            .confirmation-buttons {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}</style>

        <button
          onClick={onConfirm}
          disabled={isSubmitting || !canConfirm}
          style={{
            padding: `${spacing[3]} ${spacing[4]}`,
            backgroundColor:
              isSubmitting || !canConfirm ? colors.neutral[300] : colors.success[600],
            color: colors.neutral[0],
            border: 'none',
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            cursor: isSubmitting || !canConfirm ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2],
            transition: 'background-color 200ms ease',
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting && canConfirm) {
              e.currentTarget.style.backgroundColor = colors.success[700];
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting && canConfirm) {
              e.currentTarget.style.backgroundColor = colors.success[600];
            }
          }}
        >
          {isSubmitting ? (
            <>
              <Icons.Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
              Confirming...
            </>
          ) : (
            <>
              <Icons.CheckCircle size={20} />
              Confirm Delivery
            </>
          )}
        </button>

        <button
          onClick={onDispute}
          disabled={isSubmitting || !canConfirm}
          style={{
            padding: `${spacing[3]} ${spacing[4]}`,
            backgroundColor: colors.neutral[0],
            color: isSubmitting || !canConfirm ? colors.text.tertiary : colors.error[600],
            border: `2px solid ${
              isSubmitting || !canConfirm ? colors.neutral[300] : colors.error[300]
            }`,
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.semibold,
            cursor: isSubmitting || !canConfirm ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2],
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting && canConfirm) {
              e.currentTarget.style.backgroundColor = colors.error[50];
              e.currentTarget.style.borderColor = colors.error[400];
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting && canConfirm) {
              e.currentTarget.style.backgroundColor = colors.neutral[0];
              e.currentTarget.style.borderColor = colors.error[300];
            }
          }}
        >
          <Icons.AlertTriangle size={20} />
          Report Issue
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
