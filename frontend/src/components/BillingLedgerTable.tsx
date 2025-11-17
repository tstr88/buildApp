/**
 * Billing Ledger Table
 * Displays transaction history with sorting and filtering
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/tokens';

interface LedgerEntry {
  id: string;
  completed_at: string;
  order_id: string | null;
  order_type: 'material' | 'rental';
  effective_value: number;
  fee_percentage: number;
  fee_amount: number;
  status: 'pending' | 'invoiced' | 'paid' | 'disputed';
  invoice_id: string | null;
  notes: string | null;
}

interface BillingLedgerTableProps {
  entries: LedgerEntry[];
  loading: boolean;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
}

export function BillingLedgerTable({ entries, loading, onSort }: BillingLedgerTableProps) {
  const { t, i18n } = useTranslation();
  const [sortField, setSortField] = useState<string>('completed_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    if (onSort) {
      onSort(field, newDirection);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { bg: colors.warning[100], text: colors.warning[700], label: t('billing.ledger.status.pending', 'Pending') },
      invoiced: { bg: colors.info[100], text: colors.info[700], label: t('billing.ledger.status.invoiced', 'Invoiced') },
      paid: { bg: colors.success[100], text: colors.success[700], label: t('billing.ledger.status.paid', 'Paid') },
      disputed: { bg: colors.error[100], text: colors.error[700], label: t('billing.ledger.status.disputed', 'Disputed') },
    };

    const { bg, text, label } = config[status as keyof typeof config] || config.pending;

    return (
      <span
        style={{
          padding: `${spacing[1]} ${spacing[3]}`,
          borderRadius: borderRadius.full,
          backgroundColor: bg,
          color: text,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
        }}
      >
        {label}
      </span>
    );
  };

  const getOrderTypeBadge = (type: string) => {
    const isMaterial = type === 'material';
    return (
      <span
        style={{
          padding: `${spacing[1]} ${spacing[2]}`,
          borderRadius: borderRadius.sm,
          backgroundColor: isMaterial ? colors.primary[100] : colors.info[100],
          color: isMaterial ? colors.primary[700] : colors.info[700],
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
        }}
      >
        {isMaterial ? t('billing.ledger.orderType.material', 'Material') : t('billing.ledger.orderType.rental', 'Rental')}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'ka' ? 'ka-GE' : 'en-US';
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return <Icons.ChevronsUpDown size={16} color={colors.text.tertiary} />;
    }
    return sortDirection === 'asc' ? (
      <Icons.ChevronUp size={16} color={colors.primary[600]} />
    ) : (
      <Icons.ChevronDown size={16} color={colors.primary[600]} />
    );
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: colors.neutral[0],
          padding: spacing[8],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          textAlign: 'center',
        }}
      >
        <div style={{ color: colors.text.tertiary }}>{t('common.loading', 'Loading...')}</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div
        style={{
          backgroundColor: colors.neutral[0],
          padding: spacing[8],
          borderRadius: borderRadius.lg,
          border: `1px solid ${colors.border.light}`,
          textAlign: 'center',
        }}
      >
        <Icons.FileText size={48} color={colors.neutral[400]} style={{ marginBottom: spacing[3] }} />
        <div
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginBottom: spacing[2],
          }}
        >
          {t('billing.ledger.noEntries', 'No transactions found')}
        </div>
        <div style={{ fontSize: typography.fontSize.sm, color: colors.text.tertiary }}>
          {t('billing.ledger.noEntriesDescription', 'Completed orders will appear here')}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: colors.neutral[0],
        borderRadius: borderRadius.lg,
        border: `1px solid ${colors.border.light}`,
        overflow: 'hidden',
        boxShadow: shadows.sm,
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: colors.neutral[50], borderBottom: `1px solid ${colors.border.light}` }}>
              <th
                onClick={() => handleSort('completed_at')}
                style={{
                  padding: spacing[3],
                  textAlign: 'left',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                  {t('billing.ledger.date', 'Date')}
                  <SortIcon field="completed_at" />
                </div>
              </th>
              <th
                style={{
                  padding: spacing[3],
                  textAlign: 'left',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                }}
              >
                {t('billing.ledger.orderType', 'Type')}
              </th>
              <th
                onClick={() => handleSort('effective_value')}
                style={{
                  padding: spacing[3],
                  textAlign: 'right',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: spacing[1] }}>
                  {t('billing.ledger.orderValue', 'Order Value')}
                  <SortIcon field="effective_value" />
                </div>
              </th>
              <th
                style={{
                  padding: spacing[3],
                  textAlign: 'right',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                }}
              >
                {t('billing.ledger.feeRate', 'Fee %')}
              </th>
              <th
                onClick={() => handleSort('fee_amount')}
                style={{
                  padding: spacing[3],
                  textAlign: 'right',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: spacing[1] }}>
                  {t('billing.ledger.feeAmount', 'Fee Amount')}
                  <SortIcon field="fee_amount" />
                </div>
              </th>
              <th
                style={{
                  padding: spacing[3],
                  textAlign: 'left',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                }}
              >
                {t('billing.ledger.status', 'Status')}
              </th>
              <th
                style={{
                  padding: spacing[3],
                  textAlign: 'left',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                }}
              >
                {t('billing.ledger.invoice', 'Invoice')}
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={entry.id}
                style={{
                  borderBottom: index < entries.length - 1 ? `1px solid ${colors.border.light}` : 'none',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <td style={{ padding: spacing[3], fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                  {formatDate(entry.completed_at)}
                </td>
                <td style={{ padding: spacing[3] }}>{getOrderTypeBadge(entry.order_type)}</td>
                <td style={{ padding: spacing[3], fontSize: typography.fontSize.sm, color: colors.text.primary, textAlign: 'right' }}>
                  ₾{entry.effective_value.toFixed(2)}
                </td>
                <td style={{ padding: spacing[3], fontSize: typography.fontSize.sm, color: colors.text.secondary, textAlign: 'right' }}>
                  {entry.fee_percentage.toFixed(2)}%
                </td>
                <td
                  style={{
                    padding: spacing[3],
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    textAlign: 'right',
                  }}
                >
                  ₾{entry.fee_amount.toFixed(2)}
                </td>
                <td style={{ padding: spacing[3] }}>{getStatusBadge(entry.status)}</td>
                <td style={{ padding: spacing[3], fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                  {entry.invoice_id || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
