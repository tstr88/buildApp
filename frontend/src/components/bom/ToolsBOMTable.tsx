/**
 * ToolsBOMTable Component
 * Bill of Materials table for tool rentals - matches BOMTable style
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

export interface ToolBOMItem {
  id: string;
  name: string;
  name_ka?: string;
  name_en?: string;
  category: string;
  rental_duration_days: number;
  daily_rate_estimate: number;
  estimated_total: number;
  notes?: string;
}

interface ToolsBOMTableProps {
  items: ToolBOMItem[];
  currency?: string;
  showTotal?: boolean;
  disclaimer?: string;
}

export const ToolsBOMTable: React.FC<ToolsBOMTableProps> = ({
  items,
  currency = '₾',
  showTotal = true,
  disclaimer,
}) => {
  const { t, i18n } = useTranslation();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getLocalizedName = (item: ToolBOMItem): string => {
    if (i18n.language === 'ka' && item.name_ka) {
      return item.name_ka;
    }
    if (i18n.language === 'en' && item.name_en) {
      return item.name_en;
    }
    return item.name;
  };

  const totalPrice = items.reduce((sum, item) => sum + item.estimated_total, 0);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat(i18n.language === 'ka' ? 'ka-GE' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // Mobile Card View
  if (isMobile) {
    return (
      <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        {/* Mobile Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: colors.neutral[0],
                borderRadius: borderRadius.lg,
                border: `1px solid ${colors.border.light}`,
                padding: spacing[4],
                boxShadow: shadows.sm,
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {/* Item Name */}
              <div
                style={{
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing[2],
                  lineHeight: typography.lineHeight.relaxed,
                  wordBreak: 'break-word',
                }}
              >
                {getLocalizedName(item)}
              </div>

              {/* Category Badge */}
              <div
                style={{
                  display: 'inline-block',
                  fontSize: typography.fontSize.xs,
                  color: colors.text.secondary,
                  backgroundColor: colors.neutral[100],
                  padding: `${spacing[1]} ${spacing[2]}`,
                  borderRadius: borderRadius.sm,
                  marginBottom: spacing[3],
                }}
              >
                {item.category}
              </div>

              {item.notes && (
                <div
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: colors.text.tertiary,
                    marginBottom: spacing[3],
                    wordBreak: 'break-word',
                  }}
                >
                  {item.notes}
                </div>
              )}

              {/* Details Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  paddingTop: spacing[3],
                  borderTop: `1px solid ${colors.border.light}`,
                  gap: spacing[3],
                }}
              >
                {/* Rental Duration */}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: spacing[1],
                    }}
                  >
                    {t('tools.rentalDuration', 'Rental')}
                  </div>
                  <div
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.rental_duration_days} {t('tools.days', 'day(s)')} × {currency}{formatPrice(item.daily_rate_estimate)}
                  </div>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: colors.text.tertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: spacing[1],
                    }}
                  >
                    {t('tools.estimatedTotal', 'Total')}
                  </div>
                  <div
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.bold,
                      color: colors.primary[600],
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currency}{formatPrice(item.estimated_total)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Total Card */}
          {showTotal && (
            <div
              style={{
                backgroundColor: colors.primary[50],
                borderRadius: borderRadius.lg,
                border: `2px solid ${colors.primary[200]}`,
                padding: spacing[4],
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: spacing[3],
                }}
              >
                <div
                  style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                  }}
                >
                  {t('tools.totalRental', 'Total Tool Rental')}
                </div>
                <div
                  style={{
                    fontSize: typography.fontSize.xl,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.primary[600],
                    whiteSpace: 'nowrap',
                  }}
                >
                  {currency}{formatPrice(totalPrice)}
                </div>
              </div>
            </div>
          )}
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
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <p
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.text.secondary,
                margin: 0,
                lineHeight: typography.lineHeight.relaxed,
                wordBreak: 'break-word',
              }}
            >
              {disclaimer}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Desktop Table View
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
                  {t('tools.equipment', 'Equipment')}
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
                  {t('tools.category', 'Category')}
                </th>
                <th
                  style={{
                    padding: `${spacing[3]} ${spacing[4]}`,
                    textAlign: 'center',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.secondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t('tools.days', 'Days')}
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
                  {t('tools.dailyRate', 'Daily Rate')}
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
                  {t('tools.total', 'Total')}
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
                    <div>{getLocalizedName(item)}</div>
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
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                    }}
                  >
                    {item.category}
                  </td>
                  <td
                    style={{
                      padding: `${spacing[4]} ${spacing[4]}`,
                      textAlign: 'center',
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.rental_duration_days}
                  </td>
                  <td
                    style={{
                      padding: `${spacing[4]} ${spacing[4]}`,
                      textAlign: 'right',
                      fontSize: typography.fontSize.base,
                      color: colors.text.secondary,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currency}{formatPrice(item.daily_rate_estimate)}
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
                    {currency}{formatPrice(item.estimated_total)}
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
                    colSpan={4}
                    style={{
                      padding: `${spacing[4]} ${spacing[4]}`,
                      textAlign: 'right',
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                    }}
                  >
                    {t('tools.totalRental', 'Total Tool Rental')}:
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
                    {currency}{formatPrice(totalPrice)}
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
            {disclaimer}
          </p>
        </div>
      )}
    </div>
  );
};
