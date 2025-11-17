/**
 * Monthly Summary Card
 * Displays current month's billing statistics
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

interface MonthlySummaryCardProps {
  completedOrders: number;
  totalEffectiveValue: number;
  avgFeeRate: number;
  feesOwed: number;
}

export function MonthlySummaryCard({ completedOrders, totalEffectiveValue, avgFeeRate, feesOwed }: MonthlySummaryCardProps) {
  const { t, i18n } = useTranslation();

  const currentMonth = new Date().toLocaleDateString(i18n.language === 'ka' ? 'ka-GE' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        padding: spacing[6],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        boxShadow: shadows.md,
      }}
    >
      <div style={{ marginBottom: spacing[5] }}>
        <h2
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[1],
          }}
        >
          {t('billing.monthlySummary', 'Monthly Summary')}
        </h2>
        <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0 }}>{currentMonth}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: spacing[5] }}>
        {/* Completed Orders */}
        <div
          style={{
            padding: spacing[4],
            backgroundColor: colors.primary[50],
            borderRadius: borderRadius.md,
            border: `1px solid ${colors.primary[100]}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
            <Icons.CheckCircle size={20} color={colors.primary[600]} />
            <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
              {t('billing.completedOrders', 'Completed Orders')}
            </div>
          </div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
            {completedOrders}
          </div>
        </div>

        {/* Total Effective Value */}
        <div
          style={{
            padding: spacing[4],
            backgroundColor: colors.success[50],
            borderRadius: borderRadius.md,
            border: `1px solid ${colors.success[100]}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
            <Icons.TrendingUp size={20} color={colors.success[600]} />
            <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
              {t('billing.totalValue', 'Total Order Value')}
            </div>
          </div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
            ₾{totalEffectiveValue.toFixed(2)}
          </div>
        </div>

        {/* Average Fee Rate */}
        <div
          style={{
            padding: spacing[4],
            backgroundColor: colors.info[50],
            borderRadius: borderRadius.md,
            border: `1px solid ${colors.info[100]}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
            <Icons.Percent size={20} color={colors.info[600]} />
            <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
              {t('billing.avgFeeRate', 'Avg. Fee Rate')}
            </div>
          </div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
            {avgFeeRate.toFixed(2)}%
          </div>
        </div>

        {/* Fees Owed */}
        <div
          style={{
            padding: spacing[4],
            backgroundColor: colors.warning[50],
            borderRadius: borderRadius.md,
            border: `1px solid ${colors.warning[100]}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
            <Icons.DollarSign size={20} color={colors.warning[600]} />
            <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
              {t('billing.feesOwed', 'Fees Owed')}
            </div>
          </div>
          <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
            ₾{feesOwed.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
