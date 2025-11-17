/**
 * BOMTable Component
 * Bill of Materials table displaying item specifications, quantities, and prices
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

export interface BOMItem {
  id: string;
  specification: string;
  specification_ka?: string;
  specification_en?: string;
  quantity: number;
  unit: string;
  unit_ka?: string;
  unit_en?: string;
  estimatedPrice: number;
  notes?: string;
}

interface BOMTableProps {
  items: BOMItem[];
  currency?: string;
  showTotal?: boolean;
  disclaimer?: string;
}

export const BOMTable: React.FC<BOMTableProps> = ({
  items,
  currency = '₾',
  showTotal = true,
  disclaimer,
}) => {
  const { t, i18n } = useTranslation();

  const getLocalizedSpec = (item: BOMItem): string => {
    if (i18n.language === 'ka' && item.specification_ka) {
      return item.specification_ka;
    }
    if (i18n.language === 'en' && item.specification_en) {
      return item.specification_en;
    }
    return item.specification;
  };

  const getLocalizedUnit = (item: BOMItem): string => {
    if (i18n.language === 'ka' && item.unit_ka) {
      return item.unit_ka;
    }
    if (i18n.language === 'en' && item.unit_en) {
      return item.unit_en;
    }
    return item.unit;
  };

  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.estimatedPrice,
    0
  );

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat(i18n.language === 'ka' ? 'ka-GE' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatQuantity = (qty: number): string => {
    return new Intl.NumberFormat(i18n.language === 'ka' ? 'ka-GE' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(qty);
  };

  return (
    <div>
      {/* Table Container */}
      <div
        style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          overflow: 'hidden',
          boxShadow: shadows.sm,
        }}
      >
        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            {/* Header */}
            <thead>
              <tr
                style={{
                  backgroundColor: colors.neutral[50],
                  borderBottom: `2px solid ${colors.border.light}`,
                }}
              >
                <th
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    textAlign: 'left',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('bom.item')}
                </th>
                <th
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    textAlign: 'right',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t('bom.quantity')}
                </th>
                <th
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    textAlign: 'left',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('bom.unit')}
                </th>
                <th
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    textAlign: 'right',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('bom.estimatedPrice')}
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom:
                      index < items.length - 1
                        ? `1px solid ${colors.border.light}`
                        : 'none',
                  }}
                >
                  <td
                    style={{
                      padding: `${spacing[4]} ${spacing[4]}`,
                      fontSize: typography.fontSize.base,
                      color: colors.text.primary,
                      lineHeight: typography.lineHeight.relaxed,
                    }}
                  >
                    <div>{getLocalizedSpec(item)}</div>
                    {item.notes && (
                      <div
                        style={{
                          fontSize: typography.fontSize.sm,
                          color: colors.text.tertiary,
                          marginTop: spacing[1],
                        }}
                      >
                        {item.notes}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      padding: `${spacing[4]} ${spacing[4]}`,
                      textAlign: 'right',
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatQuantity(item.quantity)}
                  </td>
                  <td
                    style={{
                      padding: `${spacing[4]} ${spacing[4]}`,
                      fontSize: typography.fontSize.base,
                      color: colors.text.secondary,
                    }}
                  >
                    {getLocalizedUnit(item)}
                  </td>
                  <td
                    style={{
                      padding: `${spacing[4]} ${spacing[4]}`,
                      textAlign: 'right',
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currency}
                    {formatPrice(item.quantity * item.estimatedPrice)}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Footer with Total */}
            {showTotal && (
              <tfoot>
                <tr
                  style={{
                    backgroundColor: colors.neutral[50],
                    borderTop: `2px solid ${colors.border.light}`,
                  }}
                >
                  <td
                    colSpan={3}
                    style={{
                      padding: `${spacing[4]} ${spacing[4]}`,
                      textAlign: 'right',
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                    }}
                  >
                    {t('bom.total')}:
                  </td>
                  <td
                    style={{
                      padding: `${spacing[4]} ${spacing[4]}`,
                      textAlign: 'right',
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.primary[600],
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currency}
                    {formatPrice(totalPrice)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      {disclaimer && (
        <div
          style={{
            marginTop: spacing[3],
            padding: spacing[3],
            backgroundColor: colors.neutral[50],
            borderRadius: borderRadius.md,
            borderLeft: `4px solid ${colors.primary[500]}`,
          }}
        >
          <p
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.text.secondary,
              margin: 0,
              lineHeight: typography.lineHeight.relaxed,
            }}
          >
            ℹ️ {disclaimer}
          </p>
        </div>
      )}
    </div>
  );
};
