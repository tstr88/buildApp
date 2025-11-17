/**
 * Order Review Card Component
 * Final review card before placing a direct order
 */

import React from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';
import type { CartItem } from './DirectOrderCart';

interface OrderReviewCardProps {
  supplierName: string;
  items: CartItem[];
  total: number;
  deliveryFee?: number;
  grandTotal: number;
  pickupOrDelivery: 'pickup' | 'delivery';
  deliveryAddress?: string;
  scheduledWindow?: {
    start?: string;
    end?: string;
  } | null;
  isNegotiable?: boolean;
  paymentTerms?: string;
  onPlaceOrder: () => void;
  isSubmitting?: boolean;
}

export const OrderReviewCard: React.FC<OrderReviewCardProps> = ({
  supplierName,
  items,
  total,
  deliveryFee = 0,
  grandTotal,
  pickupOrDelivery,
  deliveryAddress,
  scheduledWindow,
  isNegotiable = false,
  paymentTerms = 'cod',
  onPlaceOrder,
  isSubmitting = false,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        boxShadow: shadows.md,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: spacing[4],
          backgroundColor: colors.primary[600],
        }}
      >
        <h3
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: colors.neutral[0],
            margin: 0,
          }}
        >
          Order Review
        </h3>
      </div>

      <div style={{ padding: spacing[4] }}>
        {/* Supplier */}
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
            Supplier
          </label>
          <p
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            {supplierName}
          </p>
        </div>

        {/* Items List */}
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
            Items ({items.length})
          </label>
          <div
            style={{
              backgroundColor: colors.neutral[50],
              borderRadius: borderRadius.md,
              padding: spacing[3],
            }}
          >
            {items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: index < items.length - 1 ? spacing[2] : 0,
                  paddingBottom: index < items.length - 1 ? spacing[2] : 0,
                  borderBottom:
                    index < items.length - 1 ? `1px solid ${colors.border.light}` : 'none',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                      margin: 0,
                      marginBottom: spacing[0.5],
                    }}
                  >
                    {item.description}
                  </p>
                  <p
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      margin: 0,
                    }}
                  >
                    {item.quantity} {item.unit} × ₾{item.unit_price.toFixed(2)}
                  </p>
                </div>
                <p
                  style={{
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    margin: 0,
                  }}
                >
                  ₾{item.subtotal.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Method */}
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
            {pickupOrDelivery === 'pickup' ? 'Pickup' : 'Delivery'}
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: spacing[3],
              backgroundColor: colors.neutral[50],
              borderRadius: borderRadius.md,
            }}
          >
            {pickupOrDelivery === 'pickup' ? (
              <Icons.MapPin size={20} color={colors.primary[600]} />
            ) : (
              <Icons.Truck size={20} color={colors.primary[600]} />
            )}
            <div>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                {pickupOrDelivery === 'pickup' ? 'Pickup from depot' : deliveryAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Scheduled Window */}
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
            Schedule
          </label>
          <div
            style={{
              padding: spacing[3],
              backgroundColor: isNegotiable ? colors.warning[50] : colors.success[50],
              border: `1px solid ${isNegotiable ? colors.warning[200] : colors.success[200]}`,
              borderRadius: borderRadius.md,
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
            }}
          >
            <Icons.Clock
              size={20}
              color={isNegotiable ? colors.warning[700] : colors.success[700]}
            />
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: isNegotiable ? colors.warning[900] : colors.success[900],
                margin: 0,
              }}
            >
              {isNegotiable
                ? 'To be confirmed by supplier'
                : scheduledWindow?.start && scheduledWindow?.end
                ? `${formatDate(scheduledWindow.start)} - ${formatDate(scheduledWindow.end)}`
                : 'TBD'}
            </p>
          </div>
        </div>

        {/* Price Breakdown */}
        <div
          style={{
            padding: spacing[4],
            backgroundColor: colors.neutral[50],
            borderRadius: borderRadius.md,
            marginBottom: spacing[4],
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: spacing[2],
            }}
          >
            <span
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary,
              }}
            >
              Subtotal
            </span>
            <span
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
              }}
            >
              ₾{total.toFixed(2)}
            </span>
          </div>
          {deliveryFee > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: spacing[2],
              }}
            >
              <span
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                }}
              >
                Delivery Fee
              </span>
              <span
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                }}
              >
                ₾{deliveryFee.toFixed(2)}
              </span>
            </div>
          )}
          <div
            style={{
              borderTop: `1px solid ${colors.border.light}`,
              paddingTop: spacing[2],
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
              }}
            >
              Total
            </span>
            <span
              style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.primary[600],
              }}
            >
              ₾{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Terms */}
        <div
          style={{
            padding: spacing[3],
            backgroundColor: colors.neutral[50],
            borderRadius: borderRadius.md,
            marginBottom: spacing[4],
          }}
        >
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              margin: 0,
            }}
          >
            <strong style={{ color: colors.text.primary }}>Payment:</strong>{' '}
            {paymentTerms === 'cod' ? 'Cash on Delivery' : 'Payment on delivery'}
          </p>
        </div>

        {/* Legal Notice */}
        <div
          style={{
            padding: spacing[3],
            backgroundColor: colors.primary[50],
            border: `1px solid ${colors.primary[200]}`,
            borderRadius: borderRadius.md,
            marginBottom: spacing[4],
          }}
        >
          <p
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.secondary,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            By placing this order, you agree to the supplier's terms and conditions. Payment will be
            made directly to the supplier upon {pickupOrDelivery === 'pickup' ? 'pickup' : 'delivery'}.
          </p>
        </div>

        {/* Place Order Button */}
        <button
          onClick={onPlaceOrder}
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: `${spacing[4]} ${spacing[6]}`,
            backgroundColor: isSubmitting ? colors.neutral[300] : colors.primary[600],
            color: colors.neutral[0],
            border: 'none',
            borderRadius: borderRadius.lg,
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2],
            transition: 'background-color 200ms ease',
            boxShadow: shadows.md,
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.backgroundColor = colors.primary[700];
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.backgroundColor = colors.primary[600];
            }
          }}
        >
          {isSubmitting ? (
            <>
              <Icons.Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
              Placing Order...
            </>
          ) : (
            <>
              <Icons.Send size={20} />
              Place Direct Order
            </>
          )}
        </button>
      </div>
    </div>
  );
};
