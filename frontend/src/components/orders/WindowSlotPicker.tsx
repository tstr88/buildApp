/**
 * Window Slot Picker Component
 * Allows buyer to select delivery/pickup time windows
 * Supports both "approximate lead time" and "negotiable" modes
 */

import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/tokens';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface TimeWindow {
  id: string;
  label: string;
  start: string;
  end: string;
  available: boolean;
}

interface WindowSlotPickerProps {
  supplierId: string;
  mode: 'approximate' | 'negotiable';
  selectedWindowId?: string | null;
  onWindowSelect: (windowId: string, start: string, end: string) => void;
  preferredWindowNote?: string;
  onPreferredNoteChange?: (note: string) => void;
  pickupOrDelivery?: 'pickup' | 'delivery';
}

export const WindowSlotPicker: React.FC<WindowSlotPickerProps> = ({
  supplierId,
  mode,
  selectedWindowId,
  onWindowSelect,
  preferredWindowNote,
  onPreferredNoteChange,
  pickupOrDelivery = 'delivery',
}) => {
  const [windows, setWindows] = useState<TimeWindow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'approximate') {
      fetchAvailableWindows();
    }
  }, [supplierId, mode]);

  const fetchAvailableWindows = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('buildapp_auth_token');
      const response = await fetch(
        `${API_URL}/api/buyers/suppliers/${supplierId}/available-windows`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setWindows(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch available windows:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeWindow = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startTime = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const endTime = endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const date = startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${date}, ${startTime} - ${endTime}`;
  };

  if (mode === 'negotiable') {
    return (
      <div>
        <h3
          style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: 0,
            marginBottom: spacing[4],
          }}
        >
          Delivery Schedule
        </h3>

        {/* Negotiable Banner */}
        <div
          style={{
            padding: spacing[4],
            backgroundColor: colors.warning[50],
            border: `1px solid ${colors.warning[200]}`,
            borderRadius: borderRadius.lg,
            marginBottom: spacing[4],
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
            <Icons.Clock
              size={24}
              color={colors.warning[700]}
              style={{ flexShrink: 0, marginTop: '2px' }}
            />
            <div>
              <h4
                style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.warning[900],
                  margin: 0,
                  marginBottom: spacing[1],
                }}
              >
                Schedule to be confirmed
              </h4>
              <p
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.warning[900],
                  margin: 0,
                }}
              >
                The supplier will propose a {pickupOrDelivery} time after you place the order. You'll be able
                to accept or negotiate the proposed schedule.
              </p>
            </div>
          </div>
        </div>

        {/* Optional Preferred Window Input */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.secondary,
              marginBottom: spacing[2],
            }}
          >
            Preferred Time (Optional)
          </label>
          <textarea
            value={preferredWindowNote || ''}
            onChange={(e) => onPreferredNoteChange?.(e.target.value)}
            placeholder="e.g., Morning delivery preferred, weekdays only"
            rows={3}
            style={{
              width: '100%',
              padding: spacing[3],
              border: `1px solid ${colors.border.light}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = colors.primary[600];
              e.target.style.boxShadow = `0 0 0 3px ${colors.primary[50]}`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = colors.border.light;
              e.target.style.boxShadow = 'none';
            }}
          />
          <p
            style={{
              fontSize: typography.fontSize.xs,
              color: colors.text.tertiary,
              margin: 0,
              marginTop: spacing[1],
            }}
          >
            Share your preferred delivery window and the supplier will try to accommodate.
          </p>
        </div>
      </div>
    );
  }

  // Approximate Lead Time Mode
  return (
    <div>
      <h3
        style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          margin: 0,
          marginBottom: spacing[4],
        }}
      >
        Select {pickupOrDelivery === 'pickup' ? 'Pickup' : 'Delivery'} Time
      </h3>

      {loading ? (
        <div
          style={{
            padding: spacing[6],
            textAlign: 'center',
            color: colors.text.tertiary,
          }}
        >
          <Icons.Loader size={32} color={colors.text.tertiary} style={{ margin: '0 auto', marginBottom: spacing[2] }} />
          <p style={{ margin: 0 }}>Loading available time slots...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {windows.length === 0 ? (
            <div
              style={{
                padding: spacing[6],
                backgroundColor: colors.neutral[50],
                border: `1px solid ${colors.border.light}`,
                borderRadius: borderRadius.lg,
                textAlign: 'center',
              }}
            >
              <Icons.Calendar
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
                No time slots available
              </p>
            </div>
          ) : (
            windows.map((window) => (
              <button
                key={window.id}
                onClick={() => onWindowSelect(window.id, window.start, window.end)}
                disabled={!window.available}
                style={{
                  padding: spacing[4],
                  border: `2px solid ${
                    selectedWindowId === window.id
                      ? colors.primary[600]
                      : window.available
                      ? colors.border.light
                      : colors.neutral[200]
                  }`,
                  borderRadius: borderRadius.lg,
                  backgroundColor:
                    selectedWindowId === window.id
                      ? colors.primary[50]
                      : window.available
                      ? colors.neutral[0]
                      : colors.neutral[50],
                  cursor: window.available ? 'pointer' : 'not-allowed',
                  opacity: window.available ? 1 : 0.6,
                  textAlign: 'left',
                  transition: 'all 200ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => {
                  if (window.available && selectedWindowId !== window.id) {
                    e.currentTarget.style.borderColor = colors.primary[300];
                    e.currentTarget.style.backgroundColor = colors.neutral[50];
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedWindowId !== window.id) {
                    e.currentTarget.style.borderColor = window.available
                      ? colors.border.light
                      : colors.neutral[200];
                    e.currentTarget.style.backgroundColor = window.available
                      ? colors.neutral[0]
                      : colors.neutral[50];
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: borderRadius.full,
                      backgroundColor:
                        selectedWindowId === window.id
                          ? colors.primary[100]
                          : colors.neutral[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icons.Clock
                      size={24}
                      color={
                        selectedWindowId === window.id
                          ? colors.primary[600]
                          : colors.text.tertiary
                      }
                    />
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.semibold,
                        color:
                          selectedWindowId === window.id
                            ? colors.primary[700]
                            : window.available
                            ? colors.text.primary
                            : colors.text.tertiary,
                        margin: 0,
                        marginBottom: spacing[1],
                      }}
                    >
                      {window.label}
                    </h4>
                    <p
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: window.available ? colors.text.secondary : colors.text.tertiary,
                        margin: 0,
                      }}
                    >
                      {formatTimeWindow(window.start, window.end)}
                    </p>
                  </div>
                </div>

                {selectedWindowId === window.id && (
                  <Icons.CheckCircle size={24} color={colors.primary[600]} />
                )}
                {!window.available && (
                  <span
                    style={{
                      fontSize: typography.fontSize.xs,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.tertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Unavailable
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Immediate Confirmation Badge */}
      {selectedWindowId && (
        <div
          style={{
            marginTop: spacing[3],
            padding: spacing[3],
            backgroundColor: colors.success[50],
            border: `1px solid ${colors.success[200]}`,
            borderRadius: borderRadius.md,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          <Icons.CheckCircle size={16} color={colors.success[700]} />
          <span
            style={{
              fontSize: typography.fontSize.sm,
              color: colors.success[900],
              fontWeight: typography.fontWeight.medium,
            }}
          >
            Immediate confirmation - Your order will be confirmed instantly
          </span>
        </div>
      )}
    </div>
  );
};
