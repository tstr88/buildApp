/**
 * Supplier Billing Page
 * Displays billing dashboard with balance, monthly summary, and transaction ledger
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius } from '../theme/tokens';
import { BillingBalanceCard } from '../components/BillingBalanceCard';
import { MonthlySummaryCard } from '../components/MonthlySummaryCard';
import { BillingLedgerTable } from '../components/BillingLedgerTable';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface BillingSummary {
  currentBalance: {
    outstandingFees: number;
    pendingFees: number;
    status: 'current' | 'due_soon' | 'overdue';
    nextBillingDate: string;
  };
  monthSummary: {
    completedOrders: number;
    totalEffectiveValue: number;
    avgFeeRate: number;
    feesOwed: number;
  };
}

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

export function SupplierBilling() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [ledgerLoading, setLedgerLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [orderType, setOrderType] = useState<'all' | 'material' | 'rental'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'invoiced' | 'paid' | 'disputed'>('all');

  useEffect(() => {
    fetchSummary();
    fetchLedger();
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [startDate, endDate, orderType, statusFilter]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/suppliers/billing/summary`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch billing summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async () => {
    setLedgerLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (orderType !== 'all') params.append('order_type', orderType);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`${API_URL}/api/suppliers/billing/ledger?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setLedgerEntries(data.data.entries);
      }
    } catch (error) {
      console.error('Failed to fetch billing ledger:', error);
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (orderType !== 'all') params.append('order_type', orderType);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`${API_URL}/api/suppliers/billing/export?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `billing-ledger-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export billing ledger:', error);
    }
  };

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: spacing[6],
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: spacing[6] }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing[2] }}>
          <div>
            <h1
              style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                margin: 0,
                marginBottom: spacing[2],
              }}
            >
              {t('billing.title', 'Billing & Payments')}
            </h1>
            <p
              style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                margin: 0,
              }}
            >
              {t('billing.subtitle', 'Track your success-fee charges and payment status')}
            </p>
          </div>
          <button
            onClick={() => setShowInfoModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: colors.neutral[0],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              color: colors.text.primary,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
            }}
          >
            <Icons.Info size={16} />
            {t('billing.howItWorks', 'How it works')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: spacing[8], color: colors.text.tertiary }}>
          {t('common.loading', 'Loading...')}
        </div>
      ) : summary ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: spacing[5], marginBottom: spacing[6] }}>
          <BillingBalanceCard
            outstandingFees={summary.currentBalance.outstandingFees}
            pendingFees={summary.currentBalance.pendingFees}
            status={summary.currentBalance.status}
            nextBillingDate={summary.currentBalance.nextBillingDate}
          />
          <MonthlySummaryCard
            completedOrders={summary.monthSummary.completedOrders}
            totalEffectiveValue={summary.monthSummary.totalEffectiveValue}
            avgFeeRate={summary.monthSummary.avgFeeRate}
            feesOwed={summary.monthSummary.feesOwed}
          />
        </div>
      ) : null}

      {/* Payment Instructions */}
      <div
        style={{
          backgroundColor: colors.info[50],
          border: `1px solid ${colors.info[200]}`,
          borderRadius: borderRadius.lg,
          padding: spacing[4],
          marginBottom: spacing[6],
        }}
      >
        <div style={{ display: 'flex', gap: spacing[3] }}>
          <Icons.CreditCard size={24} color={colors.info[600]} style={{ flexShrink: 0 }} />
          <div>
            <h3
              style={{
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color: colors.info[900],
                margin: 0,
                marginBottom: spacing[2],
              }}
            >
              {t('billing.paymentInstructions.title', 'Payment Instructions')}
            </h3>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.info[800], margin: 0, marginBottom: spacing[2] }}>
              {t(
                'billing.paymentInstructions.description',
                'Invoices are generated on the 1st of each month for the previous month\'s completed orders. Payment is due within 15 days.'
              )}
            </p>
            <div style={{ fontSize: typography.fontSize.sm, color: colors.info[800] }}>
              <strong>{t('billing.paymentInstructions.bankDetails', 'Bank Details')}:</strong>
              <br />
              {t('billing.paymentInstructions.bankName', 'Bank')}: TBC Bank
              <br />
              {t('billing.paymentInstructions.accountNumber', 'Account')}: GE12TB1234567890123456
              <br />
              {t('billing.paymentInstructions.reference', 'Reference')}: {t('billing.paymentInstructions.referenceFormat', 'Invoice Number')}
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[4] }}>
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            {t('billing.ledger.title', 'Transaction History')}
          </h2>
          <button
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[2]} ${spacing[4]}`,
              backgroundColor: colors.primary[600],
              border: 'none',
              borderRadius: borderRadius.md,
              color: colors.neutral[0],
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              cursor: 'pointer',
            }}
          >
            <Icons.Download size={16} />
            {t('billing.ledger.export', 'Export CSV')}
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing[3],
            marginBottom: spacing[4],
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                marginBottom: spacing[1],
              }}
            >
              {t('billing.ledger.filters.startDate', 'Start Date')}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: spacing[2],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                marginBottom: spacing[1],
              }}
            >
              {t('billing.ledger.filters.endDate', 'End Date')}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: spacing[2],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                marginBottom: spacing[1],
              }}
            >
              {t('billing.ledger.filters.orderType', 'Order Type')}
            </label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as typeof orderType)}
              style={{
                width: '100%',
                padding: spacing[2],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
              }}
            >
              <option value="all">{t('billing.ledger.filters.all', 'All')}</option>
              <option value="material">{t('billing.ledger.filters.material', 'Material')}</option>
              <option value="rental">{t('billing.ledger.filters.rental', 'Rental')}</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                marginBottom: spacing[1],
              }}
            >
              {t('billing.ledger.filters.status', 'Status')}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              style={{
                width: '100%',
                padding: spacing[2],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
              }}
            >
              <option value="all">{t('billing.ledger.filters.all', 'All')}</option>
              <option value="pending">{t('billing.ledger.filters.pending', 'Pending')}</option>
              <option value="invoiced">{t('billing.ledger.filters.invoiced', 'Invoiced')}</option>
              <option value="paid">{t('billing.ledger.filters.paid', 'Paid')}</option>
              <option value="disputed">{t('billing.ledger.filters.disputed', 'Disputed')}</option>
            </select>
          </div>
        </div>

        <BillingLedgerTable entries={ledgerEntries} loading={ledgerLoading} />
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div
          onClick={() => setShowInfoModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.neutral[0],
              borderRadius: borderRadius.lg,
              padding: spacing[6],
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: spacing[4] }}>
              <h2
                style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  margin: 0,
                }}
              >
                {t('billing.modal.title', 'How Success Fees Work')}
              </h2>
              <button
                onClick={() => setShowInfoModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: spacing[1],
                  color: colors.text.tertiary,
                }}
              >
                <Icons.X size={24} />
              </button>
            </div>

            <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary, lineHeight: '1.6' }}>
              <p>
                {t(
                  'billing.modal.paragraph1',
                  'Buildapp charges a success fee only on completed orders. This means you only pay when you successfully deliver materials or complete rentals.'
                )}
              </p>
              <p>
                <strong>{t('billing.modal.feeStructure', 'Fee Structure')}:</strong>
              </p>
              <ul>
                <li>{t('billing.modal.defaultRate', 'Default rate: 5% of order value')}</li>
                <li>{t('billing.modal.calculatedOn', 'Calculated on the final delivered value after any adjustments')}</li>
                <li>{t('billing.modal.appliesTo', 'Applies to both material orders and equipment rentals')}</li>
              </ul>
              <p>
                <strong>{t('billing.modal.billingCycle', 'Billing Cycle')}:</strong>
              </p>
              <ol>
                <li>{t('billing.modal.step1', 'Orders are marked as "Pending" when completed')}</li>
                <li>{t('billing.modal.step2', 'Invoices are generated on the 1st of each month')}</li>
                <li>{t('billing.modal.step3', 'Payment is due within 15 days of invoice date')}</li>
                <li>{t('billing.modal.step4', 'Fees are marked as "Paid" once payment is received')}</li>
              </ol>
              <p>
                {t(
                  'billing.modal.questions',
                  'If you have questions about any charges or need to dispute a fee, please contact our support team.'
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
