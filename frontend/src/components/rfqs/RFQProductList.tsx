/**
 * RFQ Product List Component
 * Product list for RFQs matching DirectOrderCart design style
 */

import React from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

export interface RFQProduct {
  id: string;
  sku_id?: string;
  description: string;
  quantity: number;
  unit: string;
  spec_notes?: string;
  base_price?: number;
}

interface RFQProductListProps {
  products: RFQProduct[];
  onUpdateProduct: (id: string, updates: Partial<RFQProduct>) => void;
  onRemoveProduct: (id: string) => void;
  onAddProduct: () => void;
  isMobile?: boolean;
}

const units = ['m3', 'ton', 'piece', 'bag', 'kg', 'm', 'm2'];

export const RFQProductList: React.FC<RFQProductListProps> = ({
  products,
  onUpdateProduct,
  onRemoveProduct,
  onAddProduct,
  isMobile = false,
}) => {
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
            <Icons.Package size={20} color={colors.primary[600]} />
            <h3
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                margin: 0,
              }}
            >
              Products
            </h3>
          </div>
          <span
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
            }}
          >
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </span>
        </div>
      </div>

      {/* Product Items */}
      <div style={{ maxHeight: isMobile ? '400px' : '500px', overflowY: 'auto' }}>
        {products.length === 0 ? (
          <div
            style={{
              padding: spacing[8],
              textAlign: 'center',
            }}
          >
            <Icons.Package
              size={48}
              color={colors.text.tertiary}
              style={{ margin: '0 auto', marginBottom: spacing[3] }}
            />
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                margin: 0,
                marginBottom: spacing[2],
              }}
            >
              No products added yet
            </p>
            <p
              style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.tertiary,
                margin: 0,
              }}
            >
              Click "Add Product" to start building your request
            </p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              style={{
                padding: spacing[4],
                borderBottom: `1px solid ${colors.border.light}`,
              }}
            >
              {/* Product Header with Description Input */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: spacing[3],
                }}
              >
                <div style={{ flex: 1, paddingRight: spacing[2] }}>
                  <input
                    type="text"
                    value={product.description}
                    onChange={(e) => onUpdateProduct(product.id, { description: e.target.value })}
                    placeholder="Product name or description"
                    style={{
                      width: '100%',
                      padding: spacing[2],
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                      backgroundColor: colors.neutral[0],
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = colors.primary[400];
                      e.target.style.boxShadow = `0 0 0 3px ${colors.primary[100]}`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = colors.border.light;
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {product.base_price && (
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.text.tertiary,
                        margin: 0,
                        marginTop: spacing[1],
                      }}
                    >
                      ~₾{product.base_price.toFixed(2)} / {product.unit}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => onRemoveProduct(product.id)}
                  style={{
                    padding: spacing[2],
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

              {/* Quantity Controls and Unit */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: spacing[3],
                }}
              >
                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <button
                    onClick={() => onUpdateProduct(product.id, { quantity: Math.max(0.1, product.quantity - 1) })}
                    disabled={product.quantity <= 0.1}
                    style={{
                      width: '36px',
                      height: '36px',
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.neutral[0],
                      cursor: product.quantity <= 0.1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: product.quantity <= 0.1 ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (product.quantity > 0.1) {
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
                    value={product.quantity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val > 0) {
                        onUpdateProduct(product.id, { quantity: val });
                      }
                    }}
                    min="0.1"
                    step="0.1"
                    style={{
                      width: '80px',
                      padding: spacing[2],
                      border: `1px solid ${colors.border.light}`,
                      borderRadius: borderRadius.md,
                      fontSize: typography.fontSize.base,
                      textAlign: 'center',
                    }}
                  />

                  <button
                    onClick={() => onUpdateProduct(product.id, { quantity: product.quantity + 1 })}
                    style={{
                      width: '36px',
                      height: '36px',
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

                {/* Unit Selector */}
                <select
                  value={product.unit}
                  onChange={(e) => onUpdateProduct(product.id, { unit: e.target.value })}
                  style={{
                    padding: `${spacing[2]} ${spacing[3]}`,
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.sm,
                    backgroundColor: colors.neutral[0],
                    cursor: 'pointer',
                    minWidth: '80px',
                  }}
                >
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>

                {/* Estimated Total */}
                {product.base_price && (
                  <div style={{ textAlign: 'right' }}>
                    <p
                      style={{
                        fontSize: typography.fontSize.lg,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.primary[600],
                        margin: 0,
                      }}
                    >
                      ~₾{(product.base_price * product.quantity).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Spec Notes */}
              <div style={{ marginTop: spacing[3] }}>
                <input
                  type="text"
                  value={product.spec_notes || ''}
                  onChange={(e) => onUpdateProduct(product.id, { spec_notes: e.target.value })}
                  placeholder="Additional specifications (optional)"
                  style={{
                    width: '100%',
                    padding: spacing[2],
                    border: `1px solid ${colors.border.light}`,
                    borderRadius: borderRadius.md,
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                    backgroundColor: colors.neutral[50],
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primary[400];
                    e.target.style.backgroundColor = colors.neutral[0];
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border.light;
                    e.target.style.backgroundColor = colors.neutral[50];
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer with Add Button */}
      <div
        style={{
          padding: spacing[4],
          backgroundColor: colors.neutral[50],
          borderTop: `1px solid ${colors.border.light}`,
        }}
      >
        <button
          onClick={onAddProduct}
          style={{
            width: '100%',
            padding: spacing[3],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing[2],
            backgroundColor: colors.primary[600],
            color: colors.neutral[0],
            border: 'none',
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.base,
            fontWeight: typography.fontWeight.medium,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary[700];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary[600];
          }}
        >
          <Icons.Plus size={20} />
          Add Product
        </button>

        {products.length > 0 && (
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.tertiary,
              margin: 0,
              marginTop: spacing[3],
              textAlign: 'center',
            }}
          >
            {products.length} {products.length === 1 ? 'product' : 'products'} added
          </p>
        )}
      </div>
    </div>
  );
};
