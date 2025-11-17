/**
 * Window Proposal Modal
 * Allows supplier to propose delivery/pickup windows
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface WindowProposalModalProps {
  orderId: string;
  deliveryType: 'pickup' | 'delivery';
  currentWindow?: { start: string; end: string };
  onClose: () => void;
  onSuccess: () => void;
}

type TimeSlot = 'morning' | 'afternoon' | 'all_day';

export function WindowProposalModal({
  orderId,
  deliveryType,
  currentWindow,
  onClose,
  onSuccess,
}: WindowProposalModalProps) {
  const { t } = useTranslation();
  const [windowStartDate, setWindowStartDate] = useState(currentWindow?.start.split('T')[0] || '');
  const [windowEndDate, setWindowEndDate] = useState(currentWindow?.end.split('T')[0] || '');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('all_day');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!windowStartDate || !windowEndDate) {
      setError(t('supplierOrders.validation.windowRequired', 'Please select delivery window'));
      return;
    }

    if (new Date(windowStartDate) > new Date(windowEndDate)) {
      setError(t('supplierOrders.validation.invalidWindow', 'End date must be after start date'));
      return;
    }

    setSubmitting(true);

    try {
      // Calculate time based on slot
      let startTime = '08:00:00';
      let endTime = '18:00:00';

      if (timeSlot === 'morning') {
        startTime = '08:00:00';
        endTime = '12:00:00';
      } else if (timeSlot === 'afternoon') {
        startTime = '13:00:00';
        endTime = '18:00:00';
      }

      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`http://localhost:3001/api/suppliers/orders/${orderId}/propose-window`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          window_start: `${windowStartDate}T${startTime}`,
          window_end: `${windowEndDate}T${endTime}`,
        }),
      });

      if (response.ok) {
        console.log('[WindowProposalModal] Proposal submitted successfully, calling onSuccess');
        await onSuccess(); // Wait for parent to refresh data
        console.log('[WindowProposalModal] onSuccess completed, closing modal');
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || t('common.error', 'An error occurred'));
      }
    } catch (err) {
      setError(t('common.error', 'An error occurred'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
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
        zIndex: 1050,
        padding: spacing[4],
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: colors.neutral[0],
          borderRadius: borderRadius.lg,
          boxShadow: shadows.xl,
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: spacing[5],
            borderBottom: `1px solid ${colors.border.light}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            {currentWindow
              ? t('supplierOrders.requestReschedule', 'Request Reschedule')
              : t('supplierOrders.proposeWindow', 'Propose Window')}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: spacing[1],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.X size={24} color={colors.text.secondary} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: spacing[5] }}>
          {currentWindow && (
            <div
              style={{
                padding: spacing[3],
                backgroundColor: colors.info[50],
                borderRadius: borderRadius.md,
                border: `1px solid ${colors.info[200]}`,
                marginBottom: spacing[4],
              }}
            >
              <div style={{ fontSize: typography.fontSize.xs, color: colors.info[700], marginBottom: spacing[1] }}>
                {t('supplierOrders.currentWindow', 'Current Window')}:
              </div>
              <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>
                {new Date(currentWindow.start).toLocaleDateString()} - {new Date(currentWindow.end).toLocaleDateString()}
              </div>
            </div>
          )}

          <div style={{ marginBottom: spacing[4] }}>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                marginBottom: spacing[2],
              }}
            >
              {deliveryType === 'pickup'
                ? t('supplierOrders.pickupWindowStart', 'Pickup Window Start')
                : t('supplierOrders.deliveryWindowStart', 'Delivery Window Start')}
            </label>
            <input
              type="date"
              value={windowStartDate}
              onChange={(e) => setWindowStartDate(e.target.value)}
              min={getTomorrowDate()}
              required
              style={{
                width: '100%',
                padding: spacing[3],
                fontSize: typography.fontSize.sm,
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.md,
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: spacing[4] }}>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                marginBottom: spacing[2],
              }}
            >
              {deliveryType === 'pickup'
                ? t('supplierOrders.pickupWindowEnd', 'Pickup Window End')
                : t('supplierOrders.deliveryWindowEnd', 'Delivery Window End')}
            </label>
            <input
              type="date"
              value={windowEndDate}
              onChange={(e) => setWindowEndDate(e.target.value)}
              min={windowStartDate || getTomorrowDate()}
              required
              style={{
                width: '100%',
                padding: spacing[3],
                fontSize: typography.fontSize.sm,
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.md,
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: spacing[5] }}>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
                marginBottom: spacing[2],
              }}
            >
              {t('supplierOrders.timeSlot', 'Time Slot')}
            </label>
            <div style={{ display: 'flex', gap: spacing[2] }}>
              <button
                type="button"
                onClick={() => setTimeSlot('morning')}
                style={{
                  flex: 1,
                  padding: spacing[3],
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  backgroundColor: timeSlot === 'morning' ? colors.primary[100] : colors.neutral[50],
                  color: timeSlot === 'morning' ? colors.primary[700] : colors.text.secondary,
                  border: `1px solid ${timeSlot === 'morning' ? colors.primary[300] : colors.border.light}`,
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {t('supplierOrders.morning', 'Morning')}
                <div style={{ fontSize: typography.fontSize.xs, marginTop: spacing[1] }}>8:00 - 12:00</div>
              </button>
              <button
                type="button"
                onClick={() => setTimeSlot('afternoon')}
                style={{
                  flex: 1,
                  padding: spacing[3],
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  backgroundColor: timeSlot === 'afternoon' ? colors.primary[100] : colors.neutral[50],
                  color: timeSlot === 'afternoon' ? colors.primary[700] : colors.text.secondary,
                  border: `1px solid ${timeSlot === 'afternoon' ? colors.primary[300] : colors.border.light}`,
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {t('supplierOrders.afternoon', 'Afternoon')}
                <div style={{ fontSize: typography.fontSize.xs, marginTop: spacing[1] }}>13:00 - 18:00</div>
              </button>
              <button
                type="button"
                onClick={() => setTimeSlot('all_day')}
                style={{
                  flex: 1,
                  padding: spacing[3],
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  backgroundColor: timeSlot === 'all_day' ? colors.primary[100] : colors.neutral[50],
                  color: timeSlot === 'all_day' ? colors.primary[700] : colors.text.secondary,
                  border: `1px solid ${timeSlot === 'all_day' ? colors.primary[300] : colors.border.light}`,
                  borderRadius: borderRadius.md,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {t('supplierOrders.allDay', 'All Day')}
                <div style={{ fontSize: typography.fontSize.xs, marginTop: spacing[1] }}>8:00 - 18:00</div>
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: spacing[3],
                backgroundColor: colors.error[50],
                borderRadius: borderRadius.md,
                border: `1px solid ${colors.error[200]}`,
                marginBottom: spacing[4],
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              <Icons.AlertCircle size={16} color={colors.error[600]} />
              <span style={{ fontSize: typography.fontSize.sm, color: colors.error[700] }}>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: spacing[3], justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                backgroundColor: 'transparent',
                color: colors.text.primary,
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.md,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                backgroundColor: submitting ? colors.primary[400] : colors.primary[600],
                color: colors.text.inverse,
                border: 'none',
                borderRadius: borderRadius.md,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {submitting ? t('common.saving', 'Saving...') : t('supplierOrders.submitProposal', 'Submit Proposal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
