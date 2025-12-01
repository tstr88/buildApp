/**
 * OfferCard Component
 * Displays a single offer with supplier details, pricing, and trust metrics
 */

import { formatCurrency, formatDate } from '../../utils/formatters';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import { ExpiryCountdown } from './ExpiryCountdown';
import { TrustLabelBadge } from './TrustLabelBadge';

interface Offer {
  id: string;
  supplier_id: string;
  supplier_name: string;
  line_prices: any[];
  total_amount: number;
  delivery_window_start?: string;
  delivery_window_end?: string;
  payment_terms: string;
  delivery_fee: number;
  notes?: string;
  expires_at: string;
  status: string;
  spec_reliability_pct: number;
  on_time_pct: number;
  issue_rate_pct: number;
  trust_sample_size: number;
}

interface OfferCardProps {
  offer: Offer;
  isLowestPrice?: boolean;
  onAccept: (offerId: string) => void;
  onMessage?: (offerId: string) => void;
}

export function OfferCard({ offer, isLowestPrice, onAccept, onMessage }: OfferCardProps) {
  const isExpired = offer.status === 'expired' || new Date(offer.expires_at) < new Date();
  const isAccepted = offer.status === 'accepted';

  const getBorderStyle = () => {
    if (isAccepted) return `2px solid ${colors.success[500]}`;
    if (isLowestPrice && !isExpired) return `2px solid ${colors.success[300]}`;
    if (isExpired) return `1px solid ${colors.neutral[200]}`;
    return `1px solid ${colors.border.light}`;
  };

  const getBackgroundColor = () => {
    if (isExpired) return colors.neutral[50];
    if (isLowestPrice) return colors.success[50];
    return colors.neutral[0];
  };

  return (
    <div
      style={{
        backgroundColor: getBackgroundColor(),
        border: getBorderStyle(),
        borderRadius: borderRadius.lg,
        padding: spacing[4],
        boxShadow: shadows.sm,
        opacity: isExpired ? 0.6 : 1,
        position: 'relative',
      }}
    >
      {/* Accepted badge */}
      {isAccepted && (
        <div
          style={{
            position: 'absolute',
            top: spacing[2],
            right: spacing[2],
            backgroundColor: colors.success[100],
            color: colors.success[700],
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.bold,
            padding: `${spacing[1]} ${spacing[2]}`,
            borderRadius: borderRadius.full,
          }}
        >
          ✓ ACCEPTED
        </div>
      )}

      {/* Lowest price badge */}
      {isLowestPrice && !isAccepted && !isExpired && (
        <div
          style={{
            position: 'absolute',
            top: spacing[2],
            right: spacing[2],
            backgroundColor: colors.success[100],
            color: colors.success[700],
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.bold,
            padding: `${spacing[1]} ${spacing[2]}`,
            borderRadius: borderRadius.full,
          }}
        >
          LOWEST PRICE
        </div>
      )}

      {/* Supplier name */}
      <h3
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          marginBottom: spacing[2],
          marginTop: 0,
        }}
      >
        {offer.supplier_name}
      </h3>

      {/* Trust labels */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: spacing[2],
          marginBottom: spacing[4],
        }}
      >
        <TrustLabelBadge
          label="Spec Reliability"
          percentage={offer.spec_reliability_pct}
          sampleSize={offer.trust_sample_size}
          type="spec"
        />
        <TrustLabelBadge
          label="On-time"
          percentage={offer.on_time_pct}
          sampleSize={offer.trust_sample_size}
          type="ontime"
        />
        <TrustLabelBadge
          label="Issue Rate"
          percentage={offer.issue_rate_pct}
          sampleSize={offer.trust_sample_size}
          type="issue"
        />
      </div>

      {/* Price breakdown */}
      <div style={{ marginBottom: spacing[4] }}>
        {offer.line_prices.map((linePrice: any, index: number) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              marginBottom: spacing[1],
            }}
          >
            <span>
              Item {index + 1} ({linePrice.quantity || ''} {linePrice.unit || ''})
            </span>
            <span style={{ fontWeight: typography.fontWeight.medium }}>
              {formatCurrency(linePrice.total_price)}
            </span>
          </div>
        ))}

        {offer.delivery_fee > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              marginBottom: spacing[1],
            }}
          >
            <span>Delivery Fee</span>
            <span style={{ fontWeight: typography.fontWeight.medium }}>
              {formatCurrency(offer.delivery_fee)}
            </span>
          </div>
        )}
      </div>

      {/* Total price */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: spacing[3],
          borderTop: `2px solid ${colors.border.light}`,
          marginBottom: spacing[4],
        }}
      >
        <span
          style={{
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
          }}
        >
          Total
        </span>
        <span
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.primary[600],
          }}
        >
          {formatCurrency(parseFloat(offer.total_amount.toString()) + offer.delivery_fee)}
        </span>
      </div>

      {/* Delivery date & time */}
      {offer.delivery_window_start && (
        <div style={{ marginBottom: spacing[3] }}>
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              margin: 0,
              marginBottom: spacing[1],
            }}
          >
            Delivery Date & Time:
          </p>
          <p
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            {formatDate(offer.delivery_window_start)} {new Date(offer.delivery_window_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      )}

      {/* Payment terms */}
      <div style={{ marginBottom: spacing[3] }}>
        <p
          style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            margin: 0,
            marginBottom: spacing[1],
          }}
        >
          Payment Terms:
        </p>
        <p
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          {offer.payment_terms.replace('_', ' ')}
        </p>
      </div>

      {/* Notes */}
      {offer.notes && (
        <div style={{ marginBottom: spacing[3] }}>
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              margin: 0,
              marginBottom: spacing[1],
            }}
          >
            Notes:
          </p>
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            {offer.notes}
          </p>
        </div>
      )}

      {/* Expiry countdown */}
      <div style={{ marginBottom: spacing[4] }}>
        <ExpiryCountdown expiresAt={offer.expires_at} />
      </div>

      {/* Action buttons */}
      {!isExpired && !isAccepted && (
        <div style={{ display: 'flex', gap: spacing[2], flexDirection: 'column' }}>
          <button
            onClick={() => onAccept(offer.id)}
            style={{
              width: '100%',
              padding: `${spacing[3]} ${spacing[4]}`,
              backgroundColor: colors.primary[600],
              color: colors.text.inverse,
              border: 'none',
              borderRadius: borderRadius.lg,
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
              transition: 'background-color 200ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.primary[700])}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.primary[600])}
          >
            Accept Offer
          </button>

          {onMessage && (
            <button
              onClick={() => onMessage(offer.id)}
              style={{
                width: '100%',
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: colors.neutral[0],
                color: colors.primary[600],
                border: `1px solid ${colors.primary[600]}`,
                borderRadius: borderRadius.lg,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                cursor: 'pointer',
                transition: 'background-color 200ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.primary[50])}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.neutral[0])}
            >
              Message Supplier
            </button>
          )}
        </div>
      )}
    </div>
  );
}
