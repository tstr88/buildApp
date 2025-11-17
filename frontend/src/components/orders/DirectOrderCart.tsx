/**
 * Direct Order Cart Component
 * Shopping cart for direct orders with line items and running total
 */

import React from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

export interface CartItem {
  sku_id?: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  subtotal: number;
}

interface DirectOrderCartProps {
  items: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  minOrderValue?: number;
  isMobile?: boolean;
}

export const DirectOrderCart: React.FC<DirectOrderCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  minOrderValue,
  isMobile = false,
}) => {
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  const meetsMinimum = !minOrderValue || total >= minOrderValue;

  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        boxShadow: shadows.sm,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: spacing[4],
          borderBottom: `1px solid ${colors.border.light}`,
          backgroundColor: colors.neutral[50],
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <Icons.ShoppingCart size={20} color={colors.primary[600]} />
            <h3
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              Cart
            </h3>
          </div>
          <span
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
            }}
          >
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Cart Items */}
      <div style={{ maxHeight: isMobile ? '300px' : '400px', overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div
            style={{
              padding: spacing[8],
              textAlign: 'center',
            }}
          >
            <Icons.ShoppingCart
              size={48}
              color={colors.text.tertiary}
              style={{ margin: '0 auto', marginBottom: spacing[3] }}
            />
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                margin: 0,
              }}
            >
              Your cart is empty
            </p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              style={{
                padding: spacing[4],
                borderBottom: `1px solid ${colors.border.light}`,
              }}
            >
              {/* Item Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: spacing[3],
                }}
              >
                <div style={{ flex: 1, paddingRight: spacing[2] }}>
                  <h4
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                      margin: 0,
                      marginBottom: spacing[1],
                    }}
                  >
                    {item.description}
                  </h4>
                  <p
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.tertiary,
                      margin: 0,
                    }}
                  >
                    ₾{item.unit_price.toFixed(2)} / {item.unit}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveItem(index)}
                  style={{
                    padding: spacing[1],
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    borderRadius: borderRadius.md,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.error[50];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icons.Trash2 size={16} color={colors.error[600]} />
                </button>
              </div>

              {/* Quantity Controls and Subtotal */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <button
                    onClick={() => onUpdateQuantity(index, Math.max(0.1, item.quantity - 1))}
                    disabled={item.quantity <= 0.1}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.neutral[0],
                      cursor: item.quantity <= 0.1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: item.quantity <= 0.1 ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (item.quantity > 0.1) {
                        e.currentTarget.style.backgroundColor = colors.neutral[50];
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.neutral[0];
                    }}
                  >
                    <Icons.Minus size={16} color={colors.text.primary} />
                  </button>

                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val > 0) {
                        onUpdateQuantity(index, val);
                      }
                    }}
                    min="0.1"
                    step="0.1"
                    style={{
                      width: '80px',
                      padding: spacing[2],
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.sm,
                      textAlign: 'center',
                    }}
                  />

                  <button
                    onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.neutral[0],
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.neutral[50];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.neutral[0];
                    }}
                  >
                    <Icons.Plus size={16} color={colors.text.primary} />
                  </button>
                </div>

                {/* Subtotal */}
                <div style={{ textAlign: 'right' }}>
                  <p
                    style={{
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      margin: 0,
                    }}
                  >
                    ₾{item.subtotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer with Total */}
      {items.length > 0 && (
        <div
          style={{
            padding: spacing[4],
            backgroundColor: colors.neutral[50],
            borderTop: `1px solid ${colors.border.light}`,
          }}
        >
          {/* Minimum Order Warning */}
          {minOrderValue && !meetsMinimum && (
            <div
              style={{
                padding: spacing[3],
                backgroundColor: colors.warning[50],
                border: `1px solid ${colors.warning[200]}`,
                borderRadius: borderRadius.md,
                marginBottom: spacing[3],
                display: 'flex',
                alignItems: 'flex-start',
                gap: spacing[2],
              }}
            >
              <Icons.AlertTriangle size={16} color={colors.warning[700]} style={{ flexShrink: 0, marginTop: '2px' }} />
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.warning[900],
                  margin: 0,
                }}
              >
                Minimum order value is ₾{minOrderValue.toFixed(2)}. Add ₾
                {(minOrderValue - total).toFixed(2)} more to proceed.
              </p>
            </div>
          )}

          {/* Total */}
          <div
            style={{
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
              ₾{total.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Re-export CartItem to ensure it's available
export type { CartItem };
