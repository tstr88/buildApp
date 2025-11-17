/**
 * Delivery Proof Card Component
 * Display delivery photos and timestamp
 */

import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface DeliveryProofCardProps {
  deliveredAt: string;
  photoUrl?: string;
  deliveryNote?: string;
  driverName?: string;
}

export const DeliveryProofCard: React.FC<DeliveryProofCardProps> = ({
  deliveredAt,
  photoUrl,
  deliveryNote,
  driverName,
}) => {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <>
      <div
        style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          padding: spacing[4],
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            marginBottom: spacing[4],
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: borderRadius.full,
              backgroundColor: colors.success[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.PackageCheck size={20} color={colors.success[700]} />
          </div>
          <div>
            <h3
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              Delivery Confirmed
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
                margin: 0,
              }}
            >
              {formatTimestamp(deliveredAt)}
            </p>
          </div>
        </div>

        {driverName && (
          <div style={{ marginBottom: spacing[4] }}>
            <label
              style={{
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.tertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: spacing[1],
              }}
            >
              Delivered By
            </label>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              {driverName}
            </p>
          </div>
        )}

        {photoUrl && (
          <div style={{ marginBottom: spacing[4] }}>
            <label
              style={{
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.tertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: spacing[2],
              }}
            >
              Delivery Photo
            </label>
            <div
              onClick={() => setIsPhotoModalOpen(true)}
              style={{
                position: 'relative',
                width: '100%',
                height: '200px',
                borderRadius: borderRadius.md,
                overflow: 'hidden',
                border: `2px solid ${colors.border.light}`,
                cursor: 'pointer',
                transition: 'border-color 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.primary[400];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border.light;
              }}
            >
              <img
                src={photoUrl}
                alt="Delivery proof"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: spacing[2],
                  right: spacing[2],
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: colors.neutral[0],
                  padding: `${spacing[1]} ${spacing[2]}`,
                  borderRadius: borderRadius.sm,
                  fontSize: typography.fontSize.xs,
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[1],
                }}
              >
                <Icons.Maximize2 size={12} />
                Click to enlarge
              </div>
            </div>
          </div>
        )}

        {deliveryNote && (
          <div>
            <label
              style={{
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.tertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: spacing[2],
              }}
            >
              Delivery Note
            </label>
            <div
              style={{
                padding: spacing[3],
                backgroundColor: colors.neutral[50],
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
              }}
            >
              {deliveryNote}
            </div>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {isPhotoModalOpen && photoUrl && (
        <div
          onClick={() => setIsPhotoModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: spacing[4],
            cursor: 'pointer',
          }}
        >
          <button
            onClick={() => setIsPhotoModalOpen(false)}
            style={{
              position: 'absolute',
              top: spacing[4],
              right: spacing[4],
              width: '40px',
              height: '40px',
              borderRadius: borderRadius.full,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: colors.neutral[0],
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <Icons.X size={24} />
          </button>
          <img
            src={photoUrl}
            alt="Delivery proof - full size"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: borderRadius.lg,
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};
