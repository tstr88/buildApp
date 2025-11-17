/**
 * Billing Balance Card
 * Displays current outstanding and pending fees
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

interface BillingBalanceCardProps {
  outstandingFees: number;
  pendingFees: number;
  status: 'current' | 'due_soon' | 'overdue';
  nextBillingDate: string;
}

export function BillingBalanceCard({ outstandingFees, pendingFees, status, nextBillingDate }: BillingBalanceCardProps) {
  const { t, i18n } = useTranslation();

  const getStatusColor = () => {
    switch (status) {
      case 'current':
        return colors.success[500];
      case 'due_soon':
        return colors.warning[500];
      case 'overdue':
        return colors.error[500];
      default:
        return colors.neutral[500];
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'current':
        return t('billing.status.current', 'Current');
      case 'due_soon':
        return t('billing.status.dueSoon', 'Due Soon');
      case 'overdue':
        return t('billing.status.overdue', 'Overdue');
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'ka' ? 'ka-GE' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' });
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing[5] }}>
        <div>
          <h2
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
              marginBottom: spacing[1],
            }}
          >
            {t('billing.currentBalance', 'Current Balance')}
          </h2>
          <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0 }}>
            {t('billing.balanceDescription', 'Fees owed to Buildapp')}
          </p>
        </div>

        <div
          style={{
            padding: `${spacing[2]} ${spacing[3]}`,
            borderRadius: borderRadius.full,
            backgroundColor: `${getStatusColor()}20`,
            color: getStatusColor(),
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
          }}
        >
          {getStatusText()}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[6], marginBottom: spacing[5] }}>
        {/* Outstanding Fees */}
        <div>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary, marginBottom: spacing[2] }}>
            {t('billing.outstandingFees', 'Outstanding (Invoiced)')}
          </div>
          <div
            style={{
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: outstandingFees > 0 ? colors.error[600] : colors.text.primary,
            }}
          >
            ₾{outstandingFees.toFixed(2)}
          </div>
        </div>

        {/* Pending Fees */}
        <div>
          <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary, marginBottom: spacing[2] }}>
            {t('billing.pendingFees', 'Pending (Not Yet Invoiced)')}
          </div>
          <div
            style={{
              fontSize: typography.fontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
            }}
          >
            ₾{pendingFees.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Next Billing Date */}
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
        <Icons.Calendar size={20} color={colors.text.tertiary} />
        <div>
          <span style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
            {t('billing.nextBillingDate', 'Next Billing Date')}:{' '}
          </span>
          <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
            {formatDate(nextBillingDate)}
          </span>
        </div>
      </div>
    </div>
  );
}
