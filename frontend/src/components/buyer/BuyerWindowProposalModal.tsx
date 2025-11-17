/**
 * Buyer Window Proposal Modal
 * Allows buyer to counter-propose delivery/pickup windows
 */

import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

interface BuyerWindowProposalModalProps {
  orderId: string;
  deliveryType: 'pickup' | 'delivery';
  currentProposal?: { start: string; end: string };
  onClose: () => void;
  onSuccess: () => void;
}

type TimeSlot = 'morning' | 'afternoon' | 'all_day';

export function BuyerWindowProposalModal({
  orderId,
  deliveryType,
  currentProposal,
  onClose,
  onSuccess,
}: BuyerWindowProposalModalProps) {
  const [windowStartDate, setWindowStartDate] = useState(currentProposal?.start.split('T')[0] || '');
  const [windowEndDate, setWindowEndDate] = useState(currentProposal?.end.split('T')[0] || '');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('all_day');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!windowStartDate || !windowEndDate) {
      setError('Please select delivery window');
      return;
    }

    if (new Date(windowStartDate) > new Date(windowEndDate)) {
      setError('End date must be after start date');
      return;
    }

    // Convert time slot to actual times
    let startTime = '08:00';
    let endTime = '18:00';

    if (timeSlot === 'morning') {
      startTime = '08:00';
      endTime = '12:00';
    } else if (timeSlot === 'afternoon') {
      startTime = '14:00';
      endTime = '18:00';
    }

    const windowStart = `${windowStartDate}T${startTime}`;
    const windowEnd = `${windowEndDate}T${endTime}`;

    setSubmitting(true);

    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(`http://localhost:3001/api/buyers/orders/${orderId}/counter-propose-window`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          window_start: windowStart,
          window_end: windowEnd,
        }),
      });

      if (response.ok) {
        console.log('[BuyerWindowProposalModal] Counter-propose SUCCESS!');
        setSuccess(true);
        // Wait a moment so user sees the success state before modal closes
        setTimeout(async () => {
          console.log('[BuyerWindowProposalModal] Calling onSuccess to refresh parent data');
          await onSuccess(); // Wait for parent to refresh data
          console.log('[BuyerWindowProposalModal] onSuccess completed, closing modal');
          onClose();
        }, 800);
      } else {
        const data = await response.json();
        console.error('[BuyerWindowProposalModal] Counter-propose error:', data);
        setError(data.error || 'Failed to propose window');
      }
    } catch (err) {
      console.error('Counter-propose exception:', err);
      setError('Failed to propose window. Please try again.');
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
        zIndex: 1000,
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
            padding: spacing[4],
            borderBottom: `1px solid ${colors.border.light}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.semibold,
              color: colors.text.primary,
              margin: 0,
            }}
          >
            Propose {deliveryType === 'pickup' ? 'Pickup' : 'Delivery'} Time
          </h2>
          <button
            onClick={onClose}
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: spacing[4] }}>
          {success && (
            <div
              style={{
                padding: spacing[3],
                backgroundColor: colors.success[50],
                border: `1px solid ${colors.success[200]}`,
                borderRadius: borderRadius.md,
                color: colors.success[700],
                fontSize: typography.fontSize.sm,
                marginBottom: spacing[4],
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
              }}
            >
              <Icons.CheckCircle size={18} />
              <span>Counter-proposal sent successfully! Waiting for supplier response...</span>
            </div>
          )}
          {error && (
            <div
              style={{
                padding: spacing[3],
                backgroundColor: colors.error[50],
                border: `1px solid ${colors.error[200]}`,
                borderRadius: borderRadius.md,
                color: colors.error[700],
                fontSize: typography.fontSize.sm,
                marginBottom: spacing[4],
              }}
            >
              {error}
            </div>
          )}

          {/* Date Selection */}
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
              Start Date
            </label>
            <input
              type="date"
              value={windowStartDate}
              onChange={(e) => setWindowStartDate(e.target.value)}
              min={getTomorrowDate()}
              required
              style={{
                width: '100%',
                padding: spacing[2],
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
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
              End Date
            </label>
            <input
              type="date"
              value={windowEndDate}
              onChange={(e) => setWindowEndDate(e.target.value)}
              min={windowStartDate || getTomorrowDate()}
              required
              style={{
                width: '100%',
                padding: spacing[2],
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
              }}
            />
          </div>

          {/* Time Slot Selection */}
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
              Preferred Time
            </label>
            <div style={{ display: 'flex', gap: spacing[2] }}>
              <button
                type="button"
                onClick={() => setTimeSlot('morning')}
                style={{
                  flex: 1,
                  padding: spacing[3],
                  backgroundColor: timeSlot === 'morning' ? colors.primary[100] : colors.neutral[0],
                  border: `2px solid ${timeSlot === 'morning' ? colors.primary[600] : colors.border.default}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: timeSlot === 'morning' ? colors.primary[700] : colors.text.secondary,
                  cursor: 'pointer',
                }}
              >
                Morning<br />
                <span style={{ fontSize: typography.fontSize.xs }}>8:00 - 12:00</span>
              </button>
              <button
                type="button"
                onClick={() => setTimeSlot('afternoon')}
                style={{
                  flex: 1,
                  padding: spacing[3],
                  backgroundColor: timeSlot === 'afternoon' ? colors.primary[100] : colors.neutral[0],
                  border: `2px solid ${timeSlot === 'afternoon' ? colors.primary[600] : colors.border.default}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: timeSlot === 'afternoon' ? colors.primary[700] : colors.text.secondary,
                  cursor: 'pointer',
                }}
              >
                Afternoon<br />
                <span style={{ fontSize: typography.fontSize.xs }}>14:00 - 18:00</span>
              </button>
              <button
                type="button"
                onClick={() => setTimeSlot('all_day')}
                style={{
                  flex: 1,
                  padding: spacing[3],
                  backgroundColor: timeSlot === 'all_day' ? colors.primary[100] : colors.neutral[0],
                  border: `2px solid ${timeSlot === 'all_day' ? colors.primary[600] : colors.border.default}`,
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: timeSlot === 'all_day' ? colors.primary[700] : colors.text.secondary,
                  cursor: 'pointer',
                }}
              >
                All Day<br />
                <span style={{ fontSize: typography.fontSize.xs }}>8:00 - 18:00</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: spacing[2], justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: colors.neutral[0],
                color: colors.text.secondary,
                border: `1px solid ${colors.border.default}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: colors.primary[600],
                color: colors.neutral[0],
                border: 'none',
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Proposing...' : 'Propose Time'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
